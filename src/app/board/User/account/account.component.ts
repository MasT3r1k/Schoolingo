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
import { ModalManager } from '@Schoolingo/modal';
import { AddEmailComponent } from './modals/add-email/add-email.component';

@Component({
  imports: [NgStyle, IconsModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css', '../../../styles/sidebar.css']
})
export class AccountComponent implements OnInit {
  private modalManager = inject(ModalManager);
  u = inject(Authentication);
  l = inject(Locale);
  Config = Config;
  Utils = Utils;

  emails: UserEmail[] = [];
  phones: UserPhone[] = [];

  ngOnInit(): void {
    this.emails = this.u.getUser().emails;
    this.phones = this.u.getUser().phones;

    this.modalManager.addModal(
      'add_email',
      {
        title: 'user.add_email.title',
        closeable: true, 
        items: [
          {
            type: 'component',
            component: AddEmailComponent
          }
        ]
      }
    )
  }

  public addEmptyEmail(): void {
    this.modalManager.openModal('add_email');
    // this.emails.push({
    //   email: "",
    //   is_created: false,
    //   is_verified: false,
    //   description: ""
    // })
  }

  public removeEmail(index: number): void {
    this.emails.splice(index, 1);
  }
}
