import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Schoolingo as App } from '@Schoolingo/App';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css', '../../Styles/card.css']
})
export class SystemComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  App = App;

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
    "Undici (URL žádosti pro komunikaci s discord botem)"
  ];
  
}
