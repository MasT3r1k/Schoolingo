import { NgComponentOutlet, NgStyle } from '@angular/common';
import { Component, Type } from '@angular/core';
import { AppConfig } from '@Schoolingo/App';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { QRCodeModule } from 'angularx-qrcode';
import { FormButton, FormInput, FormList, FormManager } from '@Components/Forms/FormManager';
import { ActivatedRoute, Params } from '@angular/router';
import { Logger } from '@Schoolingo/Logger';
import { Title } from '@angular/platform-browser';
import { Schoolingo } from '@Schoolingo';
import { Storage } from '@Schoolingo/Storage';
import { Subscription } from 'rxjs';
import { AuthLogin } from './Tabs/Login/Login';

export type pageTypes = 'login' | 'forgotpass';
type QRPages = 'loading' | 'error' | 'scan' | 'trylogin';

interface QRStatus {
  whatIsVisible: QRPages;
  code?: string;
  error?: boolean;
};

@Component({
  standalone: true,
  imports: [QRCodeModule, NgStyle, NgComponentOutlet],
  providers: [Storage],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css', '../Styles/card.css', '../Styles/select.css']
})
export class AuthComponent {
  public App = AppConfig;

  private Listeners: Subscription[] = [];
  private QRListeners: Subscription[] = [];
  private routerSocket!: Subscription;

  constructor(
    public school: School,
    private formList: FormList,
    private logger: Logger,
    private title: Title,
    private route: ActivatedRoute,
    public schoolingo: Schoolingo,
  ) {
    this.form = formList.getForm(this.formName) as FormManager;
  }


  // Form
  public formName = 'Login_Form';
  public inputs: FormInput[] = [];
  public buttons: FormButton[] = [];
  public form: FormManager;


  public selectLanguage(lng: languages): void {
    if (this.schoolingo.locale.getUserLocale() == lng) {return;}
    this.schoolingo.locale.setUserLocale(lng);
  }

  public component: Type<any> = AuthLogin;

  // // Switch forms
  // public switch(type: pageTypes): void {
  //   switch (type) {
  //     case 'login':
  //       this.inputs = [
  //         {
  //           type: 'text',
  //           name: 'username',
  //           placeholder: 'username',
  //           label: 'username',
  //         },
  //         {
  //           type: 'password',
  //           name: 'password',
  //           placeholder: 'password',
  //           label: 'password',
  //           notes: [
  //             {
  //               note: 'forgot_pass',
  //               func: () => {
  //                 window.history.pushState(100, "Forgot password", "/login?forgotpass")
  //                 this.switch('forgotpass');
  //               },
  //             },
  //           ],
  //         },
  //       ];

  //       this.buttons = [{ label: 'login_btn', executed: 'logining_btn', func: (inputs: FormInput[]) => { console.log(inputs);this.auth.login(this.auth.getValue(inputs[0].value), this.auth.getValue(inputs[1].value)) }}];
  //       break;
  //     case 'forgotpass':
  //       this.inputs = [
  //           {
  //             type: 'text',
  //             name: 'username',
  //             placeholder: 'username',
  //             label: 'username',
  //             notes: [
  //               {
  //                 note: 'remembered_pass',
  //                 func: () => {
  //                   window.history.pushState(100, "Login", "/login")
  //                   this.switch('login');
  //                 },
  //               },
  //             ],
  //           },
  //         ];

  //         this.buttons = [{ label: 'reset_pass', executed: 'reseting_pass', func: () => {this.auth.login(this.form.formData.value.username, this.form.formData.value.password)} }];
  //       break;
    
  //   }

  //   this.form = this.formList.getForm(this.formName)!;
  //   if (this.form) {
  //     this.form.updateInputs(this.inputs);
  //     this.form.updateButtons(this.buttons);
  //     this.form.refreshFormGroup()
  //   }
  // }

  ngOnInit(): void {
    this.schoolingo.resetToDefault();
    this.schoolingo.socketService.connect();

    this.form = this.formList.getForm(this.formName)!;

    this.schoolingo.auth.page = 'login';
    this.Listeners.push(this.route.queryParamMap.subscribe((param: Params) => {
      if (param.params['forgotpass'] != undefined) {
        this.schoolingo.auth.page = 'forgot';

      }
    }));

    this.title.setTitle(
      this.schoolingo.locale.getLocale('login_title') + ' | ' + this.App.APP_NAME
    );
    this.schoolingo.sidebar.sidebarToggled = false;

    this.Listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.refreshQRcode()
    }));

    this.Listeners.push(this.schoolingo.socketService.addFunction("disconnect").subscribe(() => {
      this.qrCode = '';
      this.qrCodeResult = null;
    }))
  }

  ngOnDestroy(): void {
    if (this.routerSocket) this.routerSocket.unsubscribe();
    if (this.form) this.form.removeMe();
    this.schoolingo.socketService.disconnect();
    this.Listeners.forEach((listen: Subscription) => listen.unsubscribe());
    this.QRListeners.forEach((listen: Subscription) => listen.unsubscribe());

  }

  // QR CODE
  private qrCode!: string;
  private qrCodeError = false;
  private qrCodeResult: any = null;
  private qrTimeout!: NodeJS.Timeout;

  public qrStatus: QRStatus = this.getQRcodeStatus();

  /**
   * Set default values to QRCode variables and reset timeout of loading qrcode
   */
  public refreshQRcode(): void {

    this.QRListeners.forEach((listen: Subscription) => listen.unsubscribe());

    this.logger.send('QRCode', 'Loading QR code..');
    this.qrCode = '';
    this.qrCodeError = false;
    this.qrCodeResult = null;
    this.qrStatus = this.getQRcodeStatus();
    
    this.schoolingo.socketService.emit("generate-qrcode");

    this.QRListeners.push(this.schoolingo.socketService.addFunction('login-qrcode').subscribe((data: string) => {
      this.logger.send('QRCode', 'QR code loaded.');
      this.qrCode = data;
      this.qrCodeError = false;
      this.qrStatus = this.getQRcodeStatus();
    }));

    this.QRListeners.push(this.schoolingo.socketService.addFunction('qrScanCode').subscribe((data: unknown) => {
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
      !this.qrCodeError &&
      this.qrCodeResult == null
    ) {
      page = 'loading';
    } else if (this.qrCode != '' && !this.qrCodeError) {
      if (this.qrCodeResult == null) {
        page = 'scan';
      } else {
        page = 'trylogin';
      }
    }
    if (page == null) page = 'error';

    return {
      whatIsVisible: page, // page
      code: this.qrCode,
    };
  }

}
