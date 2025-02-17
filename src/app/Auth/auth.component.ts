import { NgClass, NgComponentOutlet, NgStyle } from '@angular/common';
import { Component, Type } from '@angular/core';
import { AppConfig } from '@Schoolingo/App';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { QRCodeModule } from 'angularx-qrcode';
import { ActivatedRoute, Params } from '@angular/router';
import { Logger } from '@Schoolingo/Logger';
import { Title } from '@angular/platform-browser';
import { Schoolingo } from '@Schoolingo';
import { Storage } from '@Schoolingo/Storage';
import { Subscription } from 'rxjs';
import { AuthLogin } from './Tabs/Login/Login';
import { AlertComponent } from '@Components/Alert/Alert';

export type pageTypes = 'login' | 'forgotpass';
type QRPages = 'loading' | 'error' | 'scan' | 'trylogin';

interface QRStatus {
  whatIsVisible: QRPages;
  code?: string;
  error?: boolean;
};

@Component({
  standalone: true,
  imports: [QRCodeModule, NgStyle, NgComponentOutlet, AlertComponent],
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
    private logger: Logger,
    private title: Title,
    private route: ActivatedRoute,
    public schoolingo: Schoolingo,
  ) {}

  public selectLanguage(lng: languages): void {
    if (this.schoolingo.locale.getUserLocale() == lng) {return;}
    this.schoolingo.locale.setUserLocale(lng);
  }

  public component: Type<any> = AuthLogin;

  ngOnInit(): void {
    this.schoolingo.resetToDefault();
    this.schoolingo.socketService.connect();

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
