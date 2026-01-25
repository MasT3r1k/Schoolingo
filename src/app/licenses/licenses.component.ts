import { Component } from '@angular/core';

@Component({
  imports: [],
  templateUrl: './licenses.component.html',
  styleUrl: './licenses.component.css'
})
export class LicensesComponent {
  public used_software: any[] = [
    {
      name: "Nodemailer",
      description: "Package used to send emails",
      link: "https://www.npmjs.com/package/nodemailer"
    },
    {

    },
    {

    }
  ];
}
