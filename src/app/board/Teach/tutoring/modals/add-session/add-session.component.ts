import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { TutoringService } from '../../../../../infrastructure/tutoring/tutoring.service';

@Component({
  selector: 'app-add-session',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './add-session.component.html',
  styleUrl: './add-session.component.css'
})
export class AddSessionComponent {
  private modalManager = inject(ModalManager);
  private tutoringService = inject(TutoringService);

  public newSession = {
    subjectId: 0,
    title: '',
    description: '',
    date: '',
    room: '',
    maxStudents: 10
  };

  public closeModal(): void {
    this.modalManager.closeModal('add_tutoring_session');
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
          this.tutoringService.loadSessions().subscribe();
          this.closeModal();
        }
      }
    });
  }
}
