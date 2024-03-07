import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Teacher, UserPermissions } from '@Schoolingo/User.d';
import { UserService } from '@Schoolingo/User';
import { FormControl } from '@angular/forms';
import { SocketService } from '@Schoolingo/Socket';
import { FormError } from '@Schoolingo/FormManager';

type MessageType = {
  label: string;
  perms: UserPermissions[];
};

@Component({
  templateUrl: './send.component.html',
  styleUrls: ['../../board.css', '../../../input.css', './send.component.css']
})
export class SendComponent {
  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public userService: UserService,
    public socketService: SocketService
  ) {}

  public selectedMessageType: number = 0;
  public selectedReceivers: number[] = [];
  public message: string = '';
  public teachers = this.schoolingo.getTeachers();

  public types: MessageType[] = [
    {       // 0
      label: 'message',
      perms: ['all']
    }, {    // 1
      label: 'homework',
      perms: ['student']
    }, {    // 2
      label: 'excusestudent',
      perms: ['parent']
    }, {    // 3
      label: 'ratestudent',
      perms: ['teacher', 'principal']
    }, {    // 4
      label: 'noticeboard',
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


  formErrors: FormError[] = [];
  public errorFilter(name: string): boolean | string {
    let filter = this.formErrors.filter((err) => err.input == name);
    return filter.length == 0 ? false : filter[0].locale;
  }

  public sendMessage(): void {

    // Validate form
    if (this.message == '') {
      this.formErrors.push({ input: 'message', locale: 'required' });
    }
    if (this.selectedReceivers.length == 0) {
      this.formErrors.push({ input: 'receiver', locale: 'required' });
    }
    if (this.formErrors.length > 0) return;

    this.socketService.getSocket().Socket?.emit('messages::sendMessage',
    {
      type: this.selectedMessageType,
      receivers: this.selectedReceivers,
      message: this.message
    });

  }

}
