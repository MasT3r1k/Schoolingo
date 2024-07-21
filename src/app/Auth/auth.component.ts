import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import * as app from '@Schoolingo/Config';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { QRCodeModule } from 'angularx-qrcode';
import { FormButton, FormInput, FormList, FormManager } from '@Components/Forms/FormManager';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserService } from '@Schoolingo/User';
import { Logger } from '@Schoolingo/Logger';
import { Title } from '@angular/platform-browser';
import { Tabs } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Storage } from '@Schoolingo/Storage';
import { Sidebar } from '@Schoolingo/Sidebar';
import { Subscription } from 'rxjs';

export type pageTypes = 'login' | 'forgotpass';
type QRPages = 'loading' | 'error' | 'scan' | 'trylogin';

type QRStatus = {
  whatIsVisible: QRPages;
  code?: string;
  error?: boolean;
};

export type LoginData = {
  status: number;
  message: string;
  token?: string;
  expires?: Date;
}

@Component({
  standalone: true,
  imports: [QRCodeModule, NgStyle, FormManager],
  providers: [Storage],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css', '../Styles/card.css', '../Styles/select.css']
})
export class AuthComponent {
  /** Imports */
  app: Record<string, string> = app;

  private Listeners: Subscription[] = [];
  private QRListeners: Subscription[] = [];
  private routerSocket!: Subscription;

  constructor(
    public school: School,
    private formList: FormList,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private logger: Logger,
    private title: Title,
    private storage: Storage,
    private tabs: Tabs,
    public schoolingo: Schoolingo
  ) {
    this.form = formList.getForm(this.formName) as FormManager;
  }


  // Form
  public formName = 'Login_Form';
  public inputs: FormInput[] = [];
  public buttons: FormButton[] = [];
  public form?: FormManager = undefined;


  public selectLanguage(lng: languages): void {
    if (this.schoolingo.locale.getUserLocale() == lng) {return;}
    this.schoolingo.locale.setUserLocale(lng);
  }

  // Switch forms
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

        this.buttons = [{ label: 'login_btn', executed: 'logining_btn', func: () => { this.login() }}];
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

          this.buttons = [{ label: 'reset_pass', executed: 'reseting_pass', func: () => {this.login()} }];
        break;
    
    }

    this.form = this.formList.getForm(this.formName);
    if (this.form) {
      this.form.updateInputs(this.inputs);
      this.form.updateButtons(this.buttons);
      this.form.refreshFormGroup()
    }
  }

  ngOnInit(): void {
    this.schoolingo.socketService.connect();

    this.form = this.formList.getForm(this.formName) as FormManager;

    this.switch('login');
    this.Listeners.push(this.route.queryParamMap.subscribe((param: Params) => {
      // Check if show forgot password form //* /login?forgotpass
      if (param['params']['forgotpass'] != undefined) {
        this.switch('forgotpass');
      }
    }));

    this.title.setTitle(
      this.schoolingo.locale.getLocale('login_title') + ' | SCHOOLINGO'
    );
    this.schoolingo.sidebar.sidebarToggled = false;

    this.refreshQRcode();

    this.Listeners.push(this.schoolingo.socketService.addFunction('login').subscribe(
      (data: LoginData) => {
        if (this.form) {
          this.form.executing = false;
        }
        if (data.status == 1 && data?.token && data?.expires) {
          this.logger.send('Login', 'Successful logged in.');
          this.storage.removeAll();
          this.userService.setToken(data.token, data.expires);
          this.schoolingo.socketService.disconnect();
          let nextURL: string = 'main';
          this.route.queryParams.forEach((param: Params) => {
            if (param['returnUrl']) {
              nextURL = param['returnUrl'].slice(1);
            }
          });
          this.router.navigate(['', nextURL]);
        } else {
          if (!data.message) return;
          if (this.form) {
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
      }
    ));
  }

  ngOnDestroy(): void {
    this.routerSocket.unsubscribe();
    if (this.form) this.form.removeMe();
    this.schoolingo.socketService.disconnect();
    this.Listeners.forEach((listen: Subscription) => listen.unsubscribe());
    this.QRListeners.forEach((listen: Subscription) => listen.unsubscribe());

  }

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
    this.schoolingo.socketService.emit('login', {
      username: this.form.formData.value.username,
      password: this.form.formData.value.password,
    });
  }

  public canLogin(): boolean {
    return !(this.form && (
      this?.form.formData.value.username == null ||
      this?.form.formData.value.username == '' ||
      this.form.formData.value.password == null ||
      this.form.formData.value.password == '')
    );
  }

  // QR CODE
  private qrCode!: string;
  private qrCodeError: boolean = false;
  private qrCodeResult: any = null;
  private qrTimeout!: NodeJS.Timeout;

  public qrStatus: QRStatus = this.getQRcodeStatus();

  /**
   * Set default values to QRCode variables and reset timeout of loading qrcode
   */
  public refreshQRcode(): void {

    this.QRListeners.forEach((listen: any) => listen.unsubscribe());

    this.logger.send('QRCode', 'Loading QR code..');
    this.qrCode = '';
    this.qrCodeError = false;
    this.qrCodeResult = null;
    this.qrStatus = this.getQRcodeStatus();

    this.QRListeners.push(this.schoolingo.socketService.addFunction('login-qrcode').subscribe((data: any) => {
      this.logger.send('QRCode', 'QR code loaded.');
      this.qrCode = data;
      this.qrCodeError = false;
      this.qrStatus = this.getQRcodeStatus();
    }));

    this.QRListeners.push(this.schoolingo.socketService.addFunction('qrScanCode').subscribe((data: any) => {
      this.qrCodeResult = data;
      this.qrStatus = this.getQRcodeStatus();
    }));

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
        this.schoolingo.locale.getLocale('logining_btn')
      );
    return this.schoolingo.locale.getLocale('login_btn');
  }

  public getQRcodeStatus(): QRStatus {
    let page: QRPages | null = null;
    if (
      this.qrCode == '' &&
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
      whatIsVisible: 'loading', // page
      code: this.qrCode,
    };
  }

}
