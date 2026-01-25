import { Component } from '@angular/core';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'app-system-error',
  imports: [],
  templateUrl: './system-error.component.html',
  styleUrl: './system-error.component.css'
})
export class SystemErrorComponent {
  public Config = Config;
  public year = new Date().getFullYear();
}
