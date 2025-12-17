import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../infrastructure/authentication';
import { TokenExpirationService } from '../../infrastructure/token-expiration/token-expiration.service';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { Subscription, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../infrastructure/config';
import { School } from '@Schoolingo/school';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './student-summary.component.html',
  styleUrls: ['./student-summary.component.css']
})
export class studentSummaryComponent implements OnInit, OnDestroy {
  private auth = inject(Authentication);
  private school = inject(School);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);

  public getName(): string {
    return this.auth.getUser().fullName;
  }

  public getSchoolName(): string {
    return this.school.config.getValue()?.name || '';
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}
