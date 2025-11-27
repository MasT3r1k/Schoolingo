import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Documents } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-rename-file',
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './rename-file.component.html',
  styleUrl: './rename-file.component.css'
})
export class RenameFileComponent {
  public l = inject(Locale);
  public documents = inject(Documents);


}
