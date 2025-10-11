import { Component } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Permission } from '@Schoolingo/Permissions';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './show-lesson.component.html',
  styleUrl: './show-lesson.component.css'
})
export class ShowLessonComponent {
  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ) {}

  public lesson = this.schoolingo.timetableSelectedLesson.getValue();
  public tab = new BehaviorSubject<number>(0);

  ngOnInit(): void {
    this.schoolingo.timetableSelectedLesson.subscribe((lesson) => {
      this.lesson = lesson;
    });
  }
}
