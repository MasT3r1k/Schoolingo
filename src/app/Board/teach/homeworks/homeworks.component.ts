import { Component, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';

@Component({
  templateUrl: './homeworks.component.html',
  styleUrls: ['./homeworks.component.css', '../../board.css']
})
export class HomeworksComponent implements OnInit {
  constructor(
    public locale: Locale,
    private socketService: SocketService
  ) {}
  public tabName: string = "Homeworks_TAB";

  ngOnInit(): void {
    this.socketService.getSocket().Socket?.emit('getUserHomeworks');
    this.socketService.addFunction("getUserHomeworks").subscribe((data: any) => {
      console.log(data);
    });
  }


}
