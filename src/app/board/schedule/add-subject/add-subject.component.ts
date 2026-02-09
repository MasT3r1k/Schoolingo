import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-add-subject',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.css'
})
export class AddSubjectComponent {
  private modalManager = inject(ModalManager);

  close(): void {
    this.modalManager.closeModal('schedule_add_subject');
  }
}
