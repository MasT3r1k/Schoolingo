import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { AddPhoneComponent } from './modals/add-phone/add-phone.component';
import { DeleteEmailComponent } from './modals/delete-email/delete-email.component';
import { DeletePhoneComponent } from './modals/delete-phone/delete-phone.component';

@Component({
  imports: [NgClass, IconsModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css', '../../../styles/sidebar.css']
})
export class AccountComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  u = inject(Authentication);
  l = inject(Locale);
  Config = Config;
  Utils = Utils;

  emails: UserEmail[] = [];
  phones: UserPhone[] = [];

  ngOnInit(): void {
    this.u.getAuthState().subscribe(() => {
      const user = this.u.getUser();
      if (user) {
        this.emails = user.emails;
        this.phones = user.phones;
      }
    });

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
    );

    this.modalManager.addModal(
      'delete_email',
      {
        title: 'user.delete_email.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: DeleteEmailComponent
          }
        ]
      }
    );

    this.modalManager.addModal(
      'add_phone',
      {
        title: 'user.add_phone.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: AddPhoneComponent
          }
        ]
      }
    );
    
    this.modalManager.addModal(
      'delete_phone',
      {
        title: 'user.delete_phone.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: DeletePhoneComponent
          }
        ]
      }
    );
  }

  public addEmptyEmail(): void {
    this.modalManager.openModal('add_email', null);
  }

  public editEmail(email: UserEmail): void {
    this.modalManager.openModal('add_email', email);
  }

  public removeEmail(email: string): void {
    this.modalManager.openModal('delete_email', email);
  }

  public verifyEmailModal(email: UserEmail): void {
    this.modalManager.openModal('add_email', { ...email, mode: 'verify' });
  }

  public addEmptyPhone(): void {
    this.modalManager.openModal('add_phone', null);
  }

  public editPhone(phone: UserPhone): void {
    this.modalManager.openModal('add_phone', phone);
  }

  public verifyPhoneModal(phone: UserPhone): void {
    this.modalManager.openModal('add_phone', { ...phone, mode: 'verify' });
  }

  public removePhone(number: string): void {
    this.modalManager.openModal('delete_phone', number);
  }
}
