import { NgComponentOutlet } from '@angular/common';
import { Component, inject, signal, Type, WritableSignal } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import { TabsComponent } from '../../Components/Tabs';

interface DashboardModule {
  id: string;
  titleKey: string;
  import: () => Promise<Type<any>>;
  component: WritableSignal<Type<any> | null>;
  permission?: string;
  icon?: string;
}

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

  modules: DashboardModule[] = [
    {
      id: 'timetable',
      titleKey: 'modules.timetable',
      icon: 'calendar',
      import: () => import('./sections/timetable/timetable.component').then(m => m.TimetableComponent),
      component: signal(null)
    },
    {
      id: 'marks',
      titleKey: 'modules.marks',
      icon: 'school',
      import: () => import('./sections/marks/marks.component').then(m => m.MarksComponent),
      component: signal(null)
    },
    {
      id: 'announcements',
      titleKey: 'modules.announcements',
      icon: 'speakerphone',
      import: () => import('./sections/announcements/announcements.component').then(m => m.AnnouncementsComponent),
      component: signal(null)
    },
    {
      id: 'homework',
      titleKey: 'modules.homework',
      icon: 'notebook',
      import: () => import('./sections/homework/homework.component').then(m => m.HomeworkComponent),
      component: signal(null)
    },
    {
      id: 'events',
      titleKey: 'modules.events',
      icon: 'calendar-event',
      import: () => import('./sections/events/events.component').then(m => m.EventsComponent),
      component: signal(null)
    },
    {
      id: 'substitutions',
      titleKey: 'modules.substitutions',
      icon: 'replace',
      import: () => import('./sections/substitutions/substitutions.component').then(m => m.SubstitutionsComponent),
      component: signal(null)
    },
    {
      id: 'traineeship',
      titleKey: 'modules.traineeship',
      icon: 'briefcase',
      import: () => import('./sections/traineeship/traineeship.component').then(m => m.TraineeshipComponent),
      component: signal(null)
    },
    {
      id: 'cafeteria',
      titleKey: 'modules.cafeteria',
      icon: 'tools-kitchen-2',
      import: () => import('./sections/cafeteria/cafeteria.component').then(m => m.CafeteriaComponent),
      component: signal(null)
    },
    {
      id: 'vehicles',
      titleKey: 'modules.vehicles',
      icon: 'car',
      import: () => import('./sections/vehicles/vehicles.component').then(m => m.VehiclesComponent),
      component: signal(null)
    }
  ];

  constructor() {
    this.loadModules();
  }

  async loadModules() {
    // Load all modules in parallel
    const loadedModules = await Promise.all(
      this.modules.map(m => m.import())
    );

    // Set each loaded component to its signal
    loadedModules.forEach((component, index) => {
      this.modules[index].component.set(component);
    });
  }
}