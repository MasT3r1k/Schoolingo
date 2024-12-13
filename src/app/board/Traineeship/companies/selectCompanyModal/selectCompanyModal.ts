import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './selectCompanyModal.html',
  styleUrls: ['../../../../Styles/input.css', './selectCompanyModal.css']
})
export class selectCompanyModal {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public showSelect: string | null = null;

}
