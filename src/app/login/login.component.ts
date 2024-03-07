import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { FormButton, FormInput, FormList, FormManager } from '@Schoolingo/FormManager';

export type pageTypes = 'login' | 'forgotpass';

type QRPages = 'loading' | 'error' | 'scan' | 'trylogin';

type QRStatus = {
  whatIsVisible: QRPages;
  code?: string;
  error?: boolean;
  user?: User;
};

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../card.css', '../input.css'],
})
export class LoginComponent implements OnInit {
  private declare routerSocket;

  public inputs: FormInput[] = [
    {
      type: 'text',
      name: 'username',
      placeholder: 'username',
      label: 'username',
    },
    {
      type: 'password',
      name: 'password',
      placeholder: 'password',
      label: 'password',
      notes: [
        {
          note: 'forgot_pass',
          func: () => {
            window.history.pushState(100, "Forgot password", "/login?forgotpass")
            this.switch('forgotpass');
          },
        },
      ],
    },
  ];
  public buttons: FormButton[] = [{ label: 'login_btn', executed: 'logining_btn', func: () => this.login() }];
  public declare form: FormManager;

  public formName: string = 'Login_Form';


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
    public theme: Theme,
    private formList: FormList
  ) {

    this.form = formList.getForm(this.formName) as FormManager;

  }

  public switch(type: pageTypes): void {
    switch (type) {
      case 'login':
        this.inputs = [
          {
            type: 'text',
            name: 'username',
            placeholder: 'username',
            label: 'username',
          },
          {
            type: 'password',
            name: 'password',
            placeholder: 'password',
            label: 'password',
            notes: [
              {
                note: 'forgot_pass',
                func: () => {
                  window.history.pushState(100, "Forgot password", "/login?forgotpass")
                  this.switch('forgotpass');
                },
              },
            ],
          },
        ];

        this.buttons = [{ label: 'login_btn', executed: 'logining_btn', func: () => this.login() }];
        break;
      case 'forgotpass':
        this.inputs = [
            {
              type: 'text',
              name: 'username',
              placeholder: 'username',
              label: 'username',
              notes: [
                {
                  note: 'remembered_pass',
                  func: () => {
                    window.history.pushState(100, "Login", "/login")
                    this.switch('login');
                  },
                },
              ],
            },
          ];

          this.buttons = [{ label: 'reset_pass', executed: 'reseting_pass', func: () => this.login() }];
        break;
    
    }

    if (!this.form) this.form = this.formList.getForm(this.formName) as FormManager;
    this.form.refreshFormGroup()
  }

  ngOnInit(): void {

    this.form = this.formList.getForm(this.formName) as FormManager;

    this.route.queryParamMap.subscribe((param: Params) => {
      // Check if show forgot password form //* /login?forgotpass
      if (param['params']['forgotpass'] != undefined) {
        this.switch('forgotpass');
      }
    });

    this.routerSocket = this.router.events.subscribe((url: any) => {
      this.tabs.clearTabs();
      if (
        (!url?.routerEvent?.urlAfterRedirects && !url?.url) ||
        !(
          url?.routerEvent?.urlAfterRedirects?.startsWith('/login') ||
          url?.url?.startsWith('/login')
        )
      ) {
        return;
      }

      this.title.setTitle(
        this.locale.getLocale('login_title') + ' | SCHOOLINGO'
      );
      this.schoolingo.sidebarToggled = false;

      this.socketService.connectAnon();
      this.refreshQRcode();

      this?.socketService.addFunctionNotConnected(
        'login',
        (data: LoginData) => {
          this.form.executing = false;
          if (data.status == 1 && data?.token && data?.expires) {
            this.logger.send('Login', 'Successful logged in.');
            this.storage.removeAll();
            this.toast.showToast(
              this.locale.getLocale('successfulLogin'),
              'success',
              5000
            );
            this.userService.setToken(data.token, data.expires);
            this.socketService.getSocket().Socket?.disconnect();
            let nextURL: string = 'main';
            this.route.queryParams.forEach((param: Params) => {
              if (param['returnUrl']) {
                nextURL = param['returnUrl'].slice(1);
              }
            });
            this.router.navigate(['', nextURL]);
          } else {
            if (!data.message) return;
            switch (data.message) {
              case 'user_not_found':
                this.form.addError('username', data.message);
                break;
              case 'wrong_password':
                this.form.addError('password', data.message);
                break;
              default:
                this.logger.send('Login', 'Error: ' + data.message);
                break;
            }
          }
        }
      );
    });
  }

  ngOnDestroy(): void {
    this.routerSocket.unsubscribe();
    this.socketService.getSocket()?.Socket?.disconnect();
  }

  // Config import
  public config = config;

  // Main login code
  public login(): void {
    if (!this.form) this.form = this.formList.getForm(this.formName) as FormManager;
    this.form.errors = [];
    if (this.canLogin() == false) {
      if (
        this.form.formData.value.username == null ||
        this.form.formData.value.username == ''
      ) {
        this.form.addError('username', 'required');
      }
      if (
        this.form.formData.value.password == null ||
        this.form.formData.value.password == ''
      ) {
        this.form.addError('password', 'required');
      }
      return;
    }
    this.form.executing = true;
    this.logger.send('Login', 'Trying to login.');
    this.socketService?.getSocket().Socket?.emit('login', {
      username: this.form.formData.value.username,
      password: this.form.formData.value.password,
    });
  }

  public canLogin(): boolean {
    return !(
      this?.form.formData.value.username == null ||
      this?.form.formData.value.username == '' ||
      this.form.formData.value.password == null ||
      this.form.formData.value.password == ''
    );
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
    if (this.form && this.form.executing == true)
      return (
        "<div class='btn-loader'></div> " +
        this.locale.getLocale('logining_btn')
      );
    return this.locale.getLocale('login_btn');
  }

  public getQRcodeStatus(): QRStatus {
    let page: QRPages | null = null;
    if (
      this.qrCode == '' &&
      this.socketService.socket_err == false &&
      this.qrCodeError == false &&
      this.qrCodeResult == null
    ) {
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
      user: this.qrCodeResult,
    };
  }
}
