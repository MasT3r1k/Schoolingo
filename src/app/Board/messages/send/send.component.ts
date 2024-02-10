import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Teacher, UserPermissions } from '@Schoolingo/User.d';
import { UserService } from '@Schoolingo/User';

type MessageType = {
  label: string;
  perms: UserPermissions[];
};

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

  public selectedMessageType: number = 0;
  public selectedReceivers: number[] = [];
  public teachers = this.schoolingo.getTeachers();

  public types: MessageType[] = [
    {
      label: 'Klasická zpráva',
      perms: ['all']
    }, {
      label: 'Odevzdání úkolu',
      perms: ['student']
    }, {
      label: 'Omluvení žáka',
      perms: ['parent']
    }, {
      label: 'Ohodnocení žáka',
      perms: ['teacher', 'principal']
    },
    {
      label: 'Zpráva na nástěnku',
      perms: ['teacher', 'principal']
    }
  ]

  public getTypes(): MessageType[] {
    return this.types.filter((type: MessageType) => this.schoolingo.checkPermissions(type.perms));
  }

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
