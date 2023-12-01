import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent as BoardMain } from './Board/main/main.component';
import { BoardComponent } from './Board/board.component';
import { IntermComponent as MarkInterm } from './Board/marks/interm/interm.component';
import { MidtermComponent as MarkMidterm } from './Board/marks/midterm/midterm.component';
import { AbsenceComponent } from './Board/absence/absence.component';
import { SettingsComponent as UserSettings } from './Board/user/settings/settings.component';
import { DevicesComponent as UserDevices } from './Board/user/devices/devices.component';
import { SubstitutionComponent } from './Board/teach/substitution/substitution.component';
import { TimetableComponent } from './Board/teach/timetable/timetable.component';
// import { ListComponent as StudentList } from './Board/students/list/list.component';
// import { CreateComponent as StudentCreate } from './Board/students/create/create.component';
// import { ListComponent as TeacherList } from './Board/teachers/list/list.component';
// import { CreateComponent as TeacherCreate } from './Board/teachers/create/create.component';
// import { ListComponent as RoomList } from './Board/rooms/list/list.component';
// import { CreateComponent as RoomCreate } from './Board/rooms/create/create.component';
// import { ListComponent as PersonList } from './Board/person/list/list.component';
// import { CreateComponent as PersonCreate } from './Board/person/create/create.component';
// import { ListComponent as SubjectList } from './Board/subjects/list/list.component';
// import { CreateComponent as SubjectCreate } from './Board/subjects/create/create.component';
// import { ClassComponent } from './Board/class/class.component';
import { SubjectsComponent } from './Board/teach/subjects/subjects.component';
import { HomeworksComponent } from './Board/teach/homeworks/homeworks.component';
import { CalendarComponent } from './Board/calendar/calendar.component';

const routes: Routes = [
{
  path: '', redirectTo: 'login', pathMatch: 'full'
},
{
  path: 'login', component: LoginComponent
}, {
  path: '', component: BoardComponent, children: [
    {
      path: 'main', component: BoardMain
    }, {
      path: 'marks', children: [{
        path: 'interm', component: MarkInterm
      }, {
        path: 'midterm', component: MarkMidterm
      }]
    }, {
      path: 'teach', children: [{
        path: 'timetable', component: TimetableComponent
      }, {
        path: 'homeworks', component: HomeworksComponent
      }, {
        path: 'substitution', component: SubstitutionComponent
      }, {
        path: 'subjects', component: SubjectsComponent
      }]
    }, {
      path: 'absence', component: AbsenceComponent
    }, {
      path: 'user', children: [{
        path: 'devices', component: UserDevices
      }, {
        path: 'settings', component: UserSettings
      }]
    }, /*{
    //   path: 'person', children: [{
        path: 'list', component: PersonList
      }, {
        path: 'create', component: PersonCreate
      }]
    }, {
      path: 'students', children: [{
        path: 'list', component: StudentList
      }, {
        path: 'create', component: StudentCreate
      }]
    }, {
      path: 'teachers', children: [{
        path: 'list', component: TeacherList
      }, {
        path: 'create', component: TeacherCreate
      }]
    }, {
      path: 'rooms', children: [{
        path: 'list', component: RoomList
      }, {
        path: 'create', component: RoomCreate
      }]
    }, {
      path: 'class', component: ClassComponent
    }, {
      path: 'subjects', children: [{
        path: 'list', component: SubjectList
      }, {
        path: 'create', component: SubjectCreate
      }]
    }, */{
      path: 'calendar', component: CalendarComponent
    }, {
      path: '**', redirectTo: ''
    }]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
