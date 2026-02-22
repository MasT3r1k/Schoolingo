import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { absence, working_mode } from '@Schoolingo/absence';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';

@Component({
  selector: 'schoolingo-timetable',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.css'
})
export class SharedTimetableComponent {
  public l = inject(Locale);
  public Utils = Utils;
  public perms = inject(Permission);

  public absenceConfig = absence;
  public workingModeConfig = working_mode;

  @Input() isLoading: boolean = false;
  @Input() timetable: any[] = [];
  @Input() timetableHours: any[] = [];
  @Input() selectedWeek: moment.Moment | null = moment();
  @Input() selectedTab: number = 0; // 0 = actual, 1 = permanent
  @Input() type: 'teacher' | 'student' | 'class' | 'room' | 'supervision' = 'student';

  public getLessonClasses(index: number, index2: number, lesson: any): string[] {
    let classes = ['sub-lesson-hour', 'lesson-count-' + (this.timetable?.[index]?.[index2]?.length || 1)];
    if (lesson.empty) {
      classes.push('empty');
    }

    if (lesson.oldSubject && lesson.oldTeacher) {
      classes.push('substitution');
    }

    return classes;
  }
}
