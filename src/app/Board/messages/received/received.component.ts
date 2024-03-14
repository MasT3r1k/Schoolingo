import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { MessageManager } from '@Schoolingo/Messages';
import { SocketService } from '@Schoolingo/Socket';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

type sentMessage = {
  receivers: any[];
  message: string;
  sent: string;
  firstName: string;
  lastName: string;
  type: number;
}

@Component({
  templateUrl: './received.component.html',
  styleUrls: ['../../board.css', '../../../input.css', './received.component.css']
})
export class ReceivedComponent implements OnInit {
  constructor(
    public locale: Locale,
    private socketService: SocketService,
    private schoolingo: Schoolingo,
    public messageManager: MessageManager
  ) {}

  public formatTime(dateText: string): string {
    let date = new Date(dateText);
    return date.getHours() + ':' + this.schoolingo.addZeros(date.getMinutes(), 2) + ' - ' + date.getDate() + '. ' + (date.getMonth() + 1) + '. ' + date.getFullYear();
  }

  ngOnInit(): void {
    this.socketService.emitEvent('messages::getMessages', {});

    this.socketService.addFunction('messages::getMessages').subscribe((data: any) => {
      console.log(data);
      this.messages = data;
    });

  }

  public messages: sentMessage[] = [];
  public message: string = '';
  public search = new FormControl('');

  public selectedMessage: number | undefined = undefined;

}
