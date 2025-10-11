import { Component, inject } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { AppConfig as App } from '@Schoolingo/App';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css', '../../Styles/card.css']
})
export class SystemComponent {
  public schoolingo = inject(Schoolingo)
  constructor() {}

  App = App;

  public getStateOfServices(): string {
    return 'V pořádku'
  }

  public libraryList: string[] = [
    "Angular 17",
    "Tabler.io (Ikony)",
    "Moment (Správa času a datumů)",
    "Socket.io (Komunikace mezi klientem a serverem)",
    "country-flag-emoji-polyfill (pro správné fungování vlajek na Windows 11)",
    "angularx-qrcode (Generování qr kódů)",
    "ag-charts-angular (Generování grafů)",
    "bcrypt (Bezpečný šifrovací systém)",
    "bluebird",
    "mysql (Databáze)",
    "Express (Backend)",
    "Node-Cache (Ukládání dočasných dat pro rychlejší načítání)",
    "Undici (URL žádosti pro komunikaci s discord botem)",
    "otpAuth (Generování 2fa kódů)",
    "Dicebear (vlastní avatary)",
    "SweetAlerts2 (hezčí Alerty)",
    "pdfkit (tvorba pdf souborů)"
  ];
  
}
