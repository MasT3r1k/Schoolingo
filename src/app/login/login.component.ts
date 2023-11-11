import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as config from '@config';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { UserService } from '@Schoolingo/User';
import { LoginData, User } from '@Schoolingo/User.d';

type QRPages = 'loading' | 'error' | 'scan' | 'trylogin';

type QRStatus = {
  whatIsVisible: QRPages;
  code?: string;
  error?: boolean;
  user?: User;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../card.css']
})
export class LoginComponent implements OnInit {


  private declare routerSocket;

  constructor(
    public locale: Locale,
    public socketService: SocketService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.routerSocket = this.router.events.subscribe((url: any) => {
      console.log(url)
      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || !(url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login')) {
        return;
      }

      this.socketService.connectAnon();
      this.refreshQRcode();

      this?.socketService.getSocket()?.Socket?.once('login', (data: LoginData) => {
        if (data.status == 1 && data?.token && data?.expires) {
          this.userService.setToken(data.token, data.expires);
          this.router.navigate(['', 'main']);
        }else{
          if (!data.message) return;
          // switch(data.message) {
          //   case "user_not_found":
          //     this.formErrors = [{ input: 'username', locale: data.message }];
          //     break;
          //   case "wrong_password":
          //     this.formErrors = [{ input: 'password', locale: data.message }];
          //     break;
          //   default:
          //     console.log('Error: ' + data.message);
          //     break;
          // } 
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

  public login(): void {
    if (!this.canLogin()) return;
    this.socketService?.getSocket().Socket?.emit('login', { username: this.username.value, password: this.password.value });
  }

  public canLogin(): boolean {
    return true;
  }

  public errorFilter(name: string): boolean {
    return false;
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
    this.qrCode = '';
    this.qrCodeError = false;
    this.qrCodeResult = null;
    this.qrStatus = this.getQRcodeStatus();

    this.socketService.getSocket()?.Socket?.on('login-qrcode', (data: any) => {
      this.qrCode = data;
      this.qrCodeError = false;
      this.qrStatus = this.getQRcodeStatus();
    });

    this.socketService.getSocket()?.Socket?.on('qrScanCode', (data) => {
      this.qrCodeResult = data;
      console.log(data);
      this.qrStatus = this.getQRcodeStatus();
    });

    clearTimeout(this.qrTimeout);
    this.qrTimeout = setTimeout(() => {
      if (this.qrCode != '') return;
      this.qrCodeError = true;
      this.qrCodeResult = null;
      this.qrStatus = this.getQRcodeStatus();
    }, 5000);


  }

  public getQRcodeStatus(): QRStatus {
    let page: QRPages;
    if (this.qrCode == '' && this.qrCodeError == false && this.qrCodeResult == null) {
      page = 'loading';
    } else if (this.qrCode != '' && this.qrCodeError == false) {
      if (this.qrCodeResult == null) {
        page = 'scan';
      } else {
        page = 'trylogin';
      }
    } else {
      page = 'error';
    }

    return {
      whatIsVisible: page,
      code: this.qrCode,
      user: this.qrCodeResult
    }
  }





}
