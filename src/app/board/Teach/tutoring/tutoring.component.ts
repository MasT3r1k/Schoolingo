import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { TutoringService, TutoringSession } from '../../../infrastructure/tutoring/tutoring.service';
import moment from 'moment';

@Component({
  selector: 'app-tutoring',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './tutoring.component.html',
  styleUrls: ['./tutoring.component.css']
})
export class TutoringComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public tutoringService = inject(TutoringService);

  public sessions: TutoringSession[] = [];
  public loading = true;
  public showCreateForm = false;

  // Form fields
  public newSession = {
    subjectId: 0,
    title: '',
    description: '',
    date: '',
    room: '',
    maxStudents: 10
  };

  ngOnInit(): void {
    this.loadSessions();
  }

  private loadSessions(): void {
    this.loading = true;
    this.tutoringService.loadSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public createSession(): void {
    if (!this.newSession.title || !this.newSession.date) return;

    this.tutoringService.createSession({
      subjectId: this.newSession.subjectId,
      title: this.newSession.title,
      description: this.newSession.description,
      date: this.newSession.date,
      room: this.newSession.room,
      maxStudents: this.newSession.maxStudents
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadSessions();
          this.resetForm();
        }
      }
    });
  }

  public cancelSession(session: TutoringSession): void {
    if (!confirm('Opravdu chcete zrušit tuto lekci?')) return;

    this.tutoringService.cancelSession(session.sessionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.sessions = this.sessions.filter(s => s.sessionId !== session.sessionId);
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

  private resetForm(): void {
    this.newSession = {
      subjectId: 0,
      title: '',
      description: '',
      date: '',
      room: '',
      maxStudents: 10
    };
    this.showCreateForm = false;
  }

  public toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }
}
