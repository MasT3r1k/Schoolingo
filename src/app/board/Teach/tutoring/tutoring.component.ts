import { Component, inject, OnInit } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { TutoringService, TutoringSession } from '../../../infrastructure/tutoring/tutoring.service';
import moment from 'moment';
import { ModalManager } from '@Schoolingo/modal';
import { AddSessionComponent } from './modals/add-session/add-session.component';

@Component({
  selector: 'app-tutoring',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './tutoring.component.html',
  styleUrls: ['./tutoring.component.css']
})
export class TutoringComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public tutoringService = inject(TutoringService);
  private modalManager = inject(ModalManager);

  public sessions = this.tutoringService.sessions;
  public loading = this.tutoringService.loading;

  ngOnInit(): void {
    this.tutoringService.loadSessions().subscribe();

    this.modalManager.addModal(
      'add_tutoring_session',
      {
        title: 'Nová lekce doučování',
        closeable: true,
        items: [
          { type: 'component', component: AddSessionComponent }
        ]
      }
    )
  }

  public cancelSession(session: TutoringSession): void {
    if (!confirm('Opravdu chcete zrušit tuto lekci?')) return;

    this.tutoringService.cancelSession(session.sessionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.tutoringService.loadSessions().subscribe();
        }
      }
    });
  }

  public formatDate(date: Date): string {
    return moment(date).format('D. M. YYYY HH:mm');
  }

  public isUpcoming(date: Date): boolean {
    return new Date(date) > new Date();
  }

  public openCreateForm(): void {
    this.modalManager.openModal('add_tutoring_session');
  }
}
