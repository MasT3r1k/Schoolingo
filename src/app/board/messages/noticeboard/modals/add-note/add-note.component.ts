import { Component, inject } from '@angular/core';
import { Locale } from '@Schoolingo/locale';

@Component({
  imports: [],
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.css'
})
export class AddNoteComponent {
  public l = inject(Locale);
}
