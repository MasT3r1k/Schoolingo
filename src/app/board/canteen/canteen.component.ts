import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Authentication } from '../../infrastructure/authentication';
import { School } from '../../infrastructure/school';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '../../infrastructure/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../infrastructure/config';
import { MoneyPipe } from "../../pipes/money/money.pipe";

@Component({
  selector: 'app-canteen',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconsModule, MoneyPipe],
  templateUrl: './canteen.component.html',
  styleUrls: ['./canteen.component.css']
})
export class CanteenComponent implements OnInit {
  userService = inject(Authentication);
  schoolService = inject(School);
  l = inject(Locale);
  http = inject(HttpClient);

  menuOpen = false;
  
  userName = '';
  roleLabel = '';
  initials = '';
  credit: number | null = null;
  hasAdminAccess = false;

  pageTitle = '';
  pageSubtitle = '';

  ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
        this.userName = user.full_name;
        this.initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2);
        
        if (user.role === 'student') {
            const className = user.classes && user.classes.length > 0 ? user.classes[0].class_name : '';
            this.roleLabel = className ? `Student · ${className}` : 'Student';
        } else if (user.role === 'teacher') {
            this.roleLabel = 'Učitel';
        } else {
            this.roleLabel = 'Zaměstnanec';
        }

        // Kontrola oprávnění pro správu jídelny
        this.hasAdminAccess = user.principal || (user.permissions && (user.permissions.includes('canteen.manage') || user.permissions.includes('canteen.issue')));
    }

    this.loadCredit();
  }

  loadCredit() {
      this.http.get<{credit: number | null, account_id: number | null}>(Config.API_URL + '/v1/canteen/credit', { withCredentials: true })
          .subscribe({
              next: (res) => {
                  this.credit = res.credit;
              },
              error: (err) => {
                  console.error('Failed to load credit', err);
              }
          });
  }

  onActivate(componentRef: any) {
    if (componentRef.title) {
      this.pageTitle = componentRef.title;
    }
    if (componentRef.subtitle) {
      this.pageSubtitle = componentRef.subtitle;
    }
  }
}
