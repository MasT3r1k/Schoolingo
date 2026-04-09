import { NgComponentOutlet } from '@angular/common';
import { Component, inject, signal, Type, WritableSignal } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import { SeasonalService } from '@Schoolingo/seasonal';
import { RouterLink } from '@angular/router';
import { modules, Modules } from '@Schoolingo/modules';

interface DashboardModule {
  id: string;
  titleKey: string;
  titleUrl?: string;
  import: () => Promise<Type<any>>;
  component: WritableSignal<Type<any> | null>;
  permission?: string[];
  modules?: modules[];
  icon?: string;
  seasonal?: boolean; // Only show during active seasonal theme
  skeletonType?: 'attendance' | 'timetable' | 'marks' | 'list' | 'menu' | 'countdown';
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [NgComponentOutlet, IconsModule, RouterLink],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  public perm = inject(Permission);
  private modulesService = inject(Modules);
  public l = inject(Locale);
  private seasonalService = inject(SeasonalService);

  public modules: DashboardModule[] = [
    {
      id: 'attendance',
      titleKey: 'modules.attendance',
      icon: 'clock',
      permission: ['teacher', 'admin', 'principal', 'admin_staff', 'maintenance', 'management', 'personnel', 'other'],
      import: () => import('./sections/attendance/attendance.component').then(m => m.AttendanceComponent),
      component: signal(null),
      skeletonType: 'attendance'
    },
    {
      id: 'timetable',
      titleKey: 'modules.timetable',
      titleUrl: '/teach/timetable',
      icon: 'calendar',
      import: () => import('./sections/timetable/timetable.component').then(m => m.TimetableComponent),
      component: signal(null),
      skeletonType: 'timetable'
    },
    {
      id: 'marks',
      titleKey: 'modules.marks',
      titleUrl: '/marks/interm',
      icon: 'school',
      permission: ['student', 'parent'],
      import: () => import('./sections/marks/marks.component').then(m => m.MarksComponent),
      component: signal(null),
      skeletonType: 'marks'
    },
    {
      id: 'announcements',
      titleKey: 'modules.announcements',
      icon: 'speakerphone',
      import: () => import('./sections/announcements/announcements.component').then(m => m.AnnouncementsComponent),
      component: signal(null),
      skeletonType: 'list'
    },
    {
      id: 'homework',
      titleKey: 'modules.homework',
      titleUrl: '/teach/homeworks',
      icon: 'notebook',
      permission: ['student', 'parent'],
      import: () => import('./sections/homework/homework.component').then(m => m.HomeworkComponent),
      component: signal(null),
      skeletonType: 'list'
    },
    {
      id: 'events',
      titleKey: 'modules.events',
      titleUrl: '/calendar',
      icon: 'calendar-event',
      import: () => import('./sections/events/events.component').then(m => m.EventsComponent),
      component: signal(null),
      skeletonType: 'list'
    },
    {
      id: 'substitutions',
      titleKey: 'modules.substitutions',
      titleUrl: '/teach/substitution',
      icon: 'replace',
      import: () => import('./sections/substitutions/substitutions.component').then(m => m.SubstitutionsComponent),
      component: signal(null),
      skeletonType: 'list'
    },
    {
      id: 'traineeship',
      titleKey: 'modules.traineeship',
      titleUrl: '/traineeship/overview',
      icon: 'briefcase',
      modules: ['traineeship'],
      permission: ['student', 'parent'],
      import: () => import('./sections/traineeship/traineeship.component').then(m => m.TraineeshipComponent),
      component: signal(null),
      skeletonType: 'list'
    },
    {
      id: 'cafeteria',
      titleKey: 'modules.cafeteria',
      icon: 'tools-kitchen-2',
      modules: ['canteen'],
      import: () => import('./sections/cafeteria/cafeteria.component').then(m => m.CafeteriaComponent),
      component: signal(null),
      skeletonType: 'menu'
    },
    {
      id: 'vehicles',
      titleKey: 'modules.vehicles',
      icon: 'car',
      permission: ['teacher'],
      modules: ['fleetVehicles'],
      import: () => import('./sections/vehicles/vehicles.component').then(m => m.VehiclesComponent),
      component: signal(null),
      skeletonType: 'list'
    },
    // === SEASONAL WIDGETS ===
    {
      id: 'seasonal-countdown',
      titleKey: 'modules.seasonal.countdown',
      icon: 'calendar-time',
      import: () => import('./sections/seasonal/countdown/countdown.component').then(m => m.CountdownComponent),
      component: signal(null),
      seasonal: true,
      skeletonType: 'countdown'
    }
  ];

  constructor() {
    this.loadModules();
  }

  async loadModules() {
    // Filter modules based on permission and seasonal status
    this.modules = this.modules.filter((module) => {
      // Check permission
      const hasPermission = module.permission ? this.perm.checkPermission(module.permission) : true;

      // Check modules
      const isActiveModule = module.modules ? this.modulesService.checkModule(module.modules) : true;
      
      // Check seasonal - only show seasonal modules when seasonal is active
      const isSeasonal = module.seasonal || false;
      const seasonalActive = this.seasonalService.isActive();
      const showSeasonal = !isSeasonal || (isSeasonal && seasonalActive);
      
      return hasPermission && showSeasonal && isActiveModule;
    });
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