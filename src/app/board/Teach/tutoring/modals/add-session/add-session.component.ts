import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { TutoringService } from '../../../../../infrastructure/tutoring/tutoring.service';
import { BoardAlertManager } from '../../../../../infrastructure/alert/board.alert.manager';

@Component({
  selector: 'app-add-session',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './add-session.component.html',
  styleUrl: './add-session.component.css'
})
export class AddSessionComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private tutoringService = inject(TutoringService);
  private alert = inject(BoardAlertManager);

  public subjects = signal<any[]>([]);
  public classes = signal<any[]>([]);
  public rooms = signal<any[]>([]);

  public newSession = {
    subjectId: undefined,
    classId: undefined,
    title: '',
    description: '',
    date: '',
    roomId: undefined,
    maxStudents: 10
  };

  ngOnInit(): void {
    this.tutoringService.getSubjects().subscribe(subjects => this.subjects.set(subjects));
    this.tutoringService.getClasses().subscribe(classes => this.classes.set(classes));
    this.tutoringService.getRooms().subscribe(rooms => this.rooms.set(rooms));
  }

  public onRoomChange(): void {
    const selectedRoom = this.rooms().find(r => r.room_id == this.newSession.roomId);
    if (selectedRoom) {
      this.newSession.maxStudents = selectedRoom.capacity;
    }
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_tutoring_session');
  }

  public createSession(): void {
    if (!this.newSession.title || !this.newSession.date) return;

    // Client-side validation for room capacity
    if (this.newSession.roomId) {
        const room = this.rooms().find(r => r.room_id == this.newSession.roomId);
        if (room && this.newSession.maxStudents > room.capacity) {
            this.alert.alert('error', `Kapacita místnosti ${room.name} je pouze ${room.capacity} studentů.`);
            return;
        }
    }

    this.tutoringService.createSession({
      subjectId: this.newSession.subjectId,
      classId: this.newSession.classId,
      title: this.newSession.title,
      description: this.newSession.description,
      date: this.newSession.date,
      roomId: parseInt(this.newSession.roomId!),
      maxStudents: this.newSession.maxStudents
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.tutoringService.loadSessions().subscribe();
          this.closeModal();
        }
      },
      error: (err) => {
        this.alert.alert('error', err.error?.error || 'Nepodařilo se vytvořit lekci.');
      }
    });
  }
}
