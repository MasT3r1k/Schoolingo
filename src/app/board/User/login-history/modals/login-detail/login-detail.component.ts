import { Component, inject, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';

@Component({
  imports: [IconsModule],
  templateUrl: './login-detail.component.html',
  styleUrl: './login-detail.component.css'
})
export class LoginDetailModalComponent implements OnInit {
  public l = inject(Locale);
  public modalManager = inject(ModalManager);
  public Utils = Utils;
  public login: any = null;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('login_detail');
    if (data) {
      this.login = data;
    }
  }
}
