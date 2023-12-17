import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Teacher } from '@Schoolingo/User.d';
import { UserService } from '@Schoolingo/User';

@Component({
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css', '../../board.css']
})
export class SendComponent {
  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public userService: UserService
  ) {}

  public selectedReceivers: any[] = [];
  public teachers = this.schoolingo.getTeachers();

  ngOnInit(): void {
    let user = this.userService.getUser();
    this.teachers = JSON.parse(JSON.stringify(this.schoolingo.getTeachers()));
    if (user?.teacherId) {
      this.teachers.forEach((teacher: Teacher, index: number) => {
        if (teacher.teacherId == user?.teacherId) {
          this.teachers.splice(index, 1);
        }
      });
    }
  }

  public sendMessage(): void {
    if (this.selectedReceivers.length == 0) {
      console.log('NO RECEIVER FOUND!');
      return;
    }
  }

}
