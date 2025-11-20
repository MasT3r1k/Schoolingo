import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-classbook',
  imports: [IconsModule],
  templateUrl: './classbook.component.html',
  styleUrl: './classbook.component.css'
})
export class ClassbookComponent {
  public l = inject(Locale);

  public selected_lesson = 0;
  public selected_tab = 0;
}
