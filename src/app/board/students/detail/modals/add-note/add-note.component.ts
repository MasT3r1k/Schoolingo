import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.css'
})
export class AddNoteComponent {
  public l = inject(Locale);
  public editingNote: any = {};

  public closeModal(): void {

  }

  public saveNote(): void {

  }
}
