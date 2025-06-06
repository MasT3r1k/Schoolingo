import { NgClass, NgComponentOutlet } from '@angular/common';
import { Component, inject, signal, Type } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import { TabsComponent } from '@Components/tabs/tabs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink, NgClass, NgComponentOutlet, IconsModule, TabsComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  public perm = inject(Permission);
  public l = inject(Locale);

  timetable = signal<Type<any> | null>(null);
  marks = signal<Type<any> | null>(null);
  announcements = signal<Type<any> | null>(null);

  constructor() {
    this.loadSections()
  }

  async loadSections() {
    // Lazy-load komponenty
    const [timetable, marks, announcements] = await Promise.all([
      import('./sections/timetable/timetable.component')
      .then(m => m.TimetableComponent),
      import('./sections/marks/marks.component')
      .then(m => m.MarksComponent),
      import('./sections/announcements/announcements.component')
      .then(m => m.AnnouncementsComponent),
    ]);

    this.timetable.set(timetable);
    this.marks.set(marks);
    this.announcements.set(announcements);
  }

}