import { NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { UserEmail, UserPhone } from '../../../infrastructure/authentication/user';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [NgStyle, IconsModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css', '../../../styles/sidebar.css']
})
export class AccountComponent implements OnInit {
  u = inject(Authentication);
  l = inject(Locale);
  Config = Config;
  Utils = Utils;

  emails: UserEmail[] = [];
  phones: UserPhone[] = [];

  ngOnInit(): void {
    this.emails = this.u.getUser().emails;
    this.phones = this.u.getUser().phones;
  }

  public addEmptyEmail(): void {
    this.emails.push({
      email: "",
      is_created: false,
      is_verified: false,
      description: ""
    })
  }

  public removeEmail(index: number): void {
    this.emails.splice(index, 1);
  }
}
