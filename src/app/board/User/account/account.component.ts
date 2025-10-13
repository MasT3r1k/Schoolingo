import { NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Config } from '@Schoolingo/config';

@Component({
  imports: [NgStyle, IconsModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css', '../../../styles/sidebar.css']
})
export class AccountComponent {
  u = inject(Authentication);
  l = inject(Locale);
  Config = Config;
}
