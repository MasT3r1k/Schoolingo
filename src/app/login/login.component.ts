import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Tabs } from '@Components/Tabs/Tabs';
import { ToastService } from '@Components/Toast';
import * as config from '@config';
import { Schoolingo } from '@Schoolingo';
import { Storage } from '@Schoolingo/Storage';
import { Locale } from '@Schoolingo/Locale';
import { Logger } from '@Schoolingo/Logger';
import { SocketService } from '@Schoolingo/Socket';
import { Theme } from '@Schoolingo/Theme';
import { UserService } from '@Schoolingo/User';
import { LoginData, User } from '@Schoolingo/User.d';

type QRPages = 'loading' | 'error' | 'scan' | 'trylogin';

export type formError = {
  input: string;
  locale: string;
}

type QRStatus = {
  whatIsVisible: QRPages;
  code?: string;
  error?: boolean;
  user?: User;
}

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../card.css', '../input.css']
})
export class LoginComponent implements OnInit {


  private declare routerSocket;
  formErrors: formError[] = [];

  constructor(
    public locale: Locale,
    public socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private logger: Logger,
    private toast: ToastService,
    public schoolingo: Schoolingo,
    public tabs: Tabs,
    private title: Title,
    private storage: Storage,
    public theme: Theme
  ) {}

  ngOnInit(): void {

    this.routerSocket = this.router.events.subscribe((url: any) => {
      this.tabs.clearTabs();
      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || !(url?.routerEvent?.urlAfterRedirects?.startsWith('/login') || url?.url?.startsWith('/login'))) { return; }

      this.title.setTitle(this.locale.getLocale('login_title') + ' | SCHOOLINGO')
      this.schoolingo.sidebarToggled = false;
  
      this.socketService.connectAnon();
      this.refreshQRcode();

  
      this?.socketService.addFunctionNotConnected('login', (data: LoginData) => {
        this.tryingToLogin = false;
        if (data.status == 1 && data?.token && data?.expires) {
          this.logger.send('Login', 'Successful logged in.');
          this.storage.removeAll();
          this.toast.showToast(this.locale.getLocale('successfulLogin'), 'success', 5000);
          this.userService.setToken(data.token, data.expires);

          let nextURL: string = 'main';
          this.route.queryParams.forEach((param: Params) => {
            if (param['returnUrl']) {
              nextURL = param['returnUrl'].slice(1);
            }
          })
          this.router.navigate(['', nextURL]);
        }else{
          if (!data.message) return;
          switch(data.message) {
            case "user_not_found":
              this.formErrors = [{ input: 'username', locale: data.message }];
              break;
            case "wrong_password":
              this.formErrors = [{ input: 'password', locale: data.message }];
              break;
            default:
              this.logger.send('Login', 'Error: ' + data.message);
              break;
          } 
        }
      })
    });

  }

  ngOnDestroy(): void {
    this.routerSocket.unsubscribe();
    this.socketService.getSocket()?.Socket?.disconnect();

  }

  // Config import
  public config = config;

  // Main login code
  username: FormControl<string | null> = new FormControl<string>('');
  password: FormControl<string | null> = new FormControl<string>('');
  public tryingToLogin: boolean = false;

  public login(): void {
    this.formErrors = [];
    if (this.canLogin() == false) {
      if (this.username.value == null || this.username.value == '') {
        this.formErrors.push({ input: 'username', locale: 'required' });
      }
      if (this.password.value == null || this.password.value == '') {
        this.formErrors.push({ input: 'password', locale: 'required' });

      }
      return;
    }
    this.tryingToLogin = true;
    this.logger.send('Login', 'Trying to login.')
    this.socketService?.getSocket().Socket?.emit('login', { username: this.username.value, password: this.password.value });
  }

  public canLogin(): boolean {
    return !(this.username.value == null || this.username.value == '' || this.password.value == null || this.password.value == '');
  }

  public errorFilter(name: string): boolean | string {
    let filter = this.formErrors.filter((err) => err.input == name);
    return (filter.length == 0) ? false : filter[0].locale;
  }


  // QR CODE
  private qrCode: string = '';
  private qrCodeError: boolean = false;
  private qrCodeResult: any = null;
  private qrTimeout: any;

  public qrStatus: QRStatus = this.getQRcodeStatus();

  /**
   * Set default values to QRCode variables and reset timeout of loading qrcode
   */
  public refreshQRcode(): void {
    this.logger.send('QRCode', 'Loading QR code..');
    this.qrCode = '';
    this.qrCodeError = false;
    this.qrCodeResult = null;
    this.qrStatus = this.getQRcodeStatus();

    this.socketService.addFunctionNotConnected('login-qrcode', (data: any) => {
      this.logger.send('QRCode', 'QR code loaded.');
      this.qrCode = data;
      this.qrCodeError = false;
      this.qrStatus = this.getQRcodeStatus();
    });

    this.socketService.addFunctionNotConnected('qrScanCode', (data: any) => {
      this.qrCodeResult = data;
      this.qrStatus = this.getQRcodeStatus();
    });

    clearTimeout(this.qrTimeout);
    this.qrTimeout = setTimeout(() => {
      if (this.qrCode != '') return;
      this.logger.send('QRCode', 'QR code failed to load.');
      this.qrCodeError = true;
      this.qrCodeResult = null;
      this.qrStatus = this.getQRcodeStatus();
    }, 5000);
  }

  public getLoginButtonText(): string {
    if (this.tryingToLogin == true) return '<div class=\'btn-loader\'></div> ' + this.locale.getLocale('logining_btn');
    return this.locale.getLocale('login_btn');
  }

  public getQRcodeStatus(): QRStatus {
    let page: QRPages | null = null;
    if (this.qrCode == '' && this.socketService.socket_err == false && this.qrCodeError == false && this.qrCodeResult == null) {
      page = 'loading';
    } else if (this.qrCode != '' && this.qrCodeError == false) {
      if (this.qrCodeResult == null) {
        page = 'scan';
      } else {
        page = 'trylogin';
      }
    }
    if (page == null) page = 'error';

    return {
      whatIsVisible: page,
      code: this.qrCode,
      user: this.qrCodeResult
    }
  }





}
