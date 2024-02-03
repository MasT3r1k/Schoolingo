import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@Components/Toast';
import { SocketService } from '@Schoolingo/Socket';
import { UserService } from '@Schoolingo/User';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.css', '../board.css']
})
export class AbsenceComponent implements OnInit {
  constructor(
    public toast: ToastService,
    private socketService: SocketService,
    private userService: UserService,
    public locale: Locale
  ) {}

  ngOnInit(): void {
    this.socketService.addFunction("getUserAbsence", (data: any) => {
      console.log(data);
    });
    this.socketService.getSocket().Socket?.emit('getUserAbsence', this.userService.getUser()?.studentId);
  }

  ngOnDestroy(): void {
    // Reset getUserAbsence
    this.socketService.socketFunctions["getUserAbsence"] = {};
  }

}
