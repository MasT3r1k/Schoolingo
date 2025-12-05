import { NgComponentOutlet } from '@angular/common';
import { Component, inject, signal, Type } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import { TabsComponent } from '../../Components/Tabs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [NgComponentOutlet, IconsModule, TabsComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  public perm = inject(Permission);
  public l = inject(Locale);

  timetable = signal<Type<any> | null>(null);
  marks = signal<Type<any> | null>(null);
  announcements = signal<Type<any> | null>(null);
  homework = signal<Type<any> | null>(null);
  events = signal<Type<any> | null>(null);
  substitutions = signal<Type<any> | null>(null);
  traineeship = signal<Type<any> | null>(null);
  cafeteria = signal<Type<any> | null>(null);
  vehicles = signal<Type<any> | null>(null);

  constructor() {
    this.loadSections()
  }

  async loadSections() {
    // Lazy-load komponentů
    const [
      timetable,
      marks,
      announcements,
      homework,
      events,
      substitutions,
      traineeship,
      cafeteria,
      vehicles
    ] = await Promise.all([
      import('./sections/timetable/timetable.component')
        .then(m => m.TimetableComponent),
      import('./sections/marks/marks.component')
        .then(m => m.MarksComponent),
      import('./sections/announcements/announcements.component')
        .then(m => m.AnnouncementsComponent),
      import('./sections/homework/homework.component')
        .then(m => m.HomeworkComponent),
      import('./sections/events/events.component')
        .then(m => m.EventsComponent),
      import('./sections/substitutions/substitutions.component')
        .then(m => m.SubstitutionsComponent),
      import('./sections/traineeship/traineeship.component')
        .then(m => m.TraineeshipComponent),
      import('./sections/cafeteria/cafeteria.component')
        .then(m => m.CafeteriaComponent),
      import('./sections/vehicles/vehicles.component')
        .then(m => m.VehiclesComponent),
    ]);

    this.timetable.set(timetable);
    this.marks.set(marks);
    this.announcements.set(announcements);
    this.homework.set(homework);
    this.events.set(events);
    this.substitutions.set(substitutions);
    this.traineeship.set(traineeship);
    this.cafeteria.set(cafeteria);
    this.vehicles.set(vehicles);
  }

}