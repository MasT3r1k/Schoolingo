import { NgClass } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Schoolingo } from "@Schoolingo";

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass],
  providers: [],
  templateUrl: './Login.html',
  styleUrls: ['./Login.css', '../../../Styles/input.css']
})
export class AuthLogin {
    constructor(
        public schoolingo: Schoolingo
    ) {}


    public checkURL(): string {
      return window.location.pathname;
    }
}