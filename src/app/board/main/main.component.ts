import { NgComponentOutlet } from '@angular/common';
import { Component, inject, signal, Type, WritableSignal, OnInit, effect } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import { SeasonalService } from '@Schoolingo/seasonal';
import { RouterLink } from '@angular/router';
import { modules, Modules } from '@Schoolingo/modules';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Dashboard } from '@Schoolingo/dashboard';

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
  imports: [NgComponentOutlet, IconsModule, RouterLink, DragDropModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public perm = inject(Permission);
  private modulesService = inject(Modules);
  public l = inject(Locale);
  private seasonalService = inject(SeasonalService);
  private dashboardService = inject(Dashboard);

  private allModules: DashboardModule[] = [
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

  public modules = signal<DashboardModule[]>([]);

  constructor() {
    // Effect to react when modulePositions are loaded
    effect(() => {
        const positions = this.dashboardService.modulePositions();
        this.loadModules(positions);
    });
  }

  ngOnInit() {}

  private loadModules(positions: { module_id: string; position: number }[]) {
    // Filter modules based on permission and seasonal status
    const filteredModules = this.allModules.filter((module) => {
      const hasPermission = module.permission ? this.perm.checkPermission(module.permission) : true;
      const isActiveModule = module.modules ? this.modulesService.checkModule(module.modules) : true;
      const isSeasonal = module.seasonal || false;
      const seasonalActive = this.seasonalService.isActive();
      const showSeasonal = !isSeasonal || (isSeasonal && seasonalActive);
      return hasPermission && showSeasonal && isActiveModule;
    });

    // Sort modules based on saved positions
    if (positions && positions.length > 0) {
        filteredModules.sort((a, b) => {
            const posA = positions.find((p: any) => p.module_id === a.id)?.position ?? 999;
            const posB = positions.find((p: any) => p.module_id === b.id)?.position ?? 999;
            return posA - posB;
        });
    }

    // Set modules signal immediately (synchronously) to ensure correct order
    this.modules.set(filteredModules);

    // Load components for these modules
    this.loadComponents(filteredModules);
  }

  private async loadComponents(modules: DashboardModule[]) {
    // Load each component and set its individual signal
    // This allows components to pop in as they load
    for (const module of modules) {
        if (!module.component()) {
            module.import().then(comp => module.component.set(comp));
        }
    }
  }

  drop(event: CdkDragDrop<DashboardModule[]>) {
    const currentModules = [...this.modules()];
    moveItemInArray(currentModules, event.previousIndex, event.currentIndex);
    this.modules.set(currentModules);
    
    // Save new positions
    const newPositions = currentModules.map((m, index) => ({
        module_id: m.id,
        position: index
    }));
    this.dashboardService.savePositions(newPositions);
  }
}