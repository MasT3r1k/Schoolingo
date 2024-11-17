import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { MessageManager } from '@Schoolingo/Messages';
import moment from 'moment';

type sentMessage = {
  messageId: number;
  receivers: any[];
  message: string;
  sent: moment.Moment;
  sender: any;
  tags: number[];
  type: number;
  isRead: boolean;
}


@Component({
  selector: 'app-received',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FormsModule],
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class ReceivedComponent {
  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public messageManager: MessageManager
  ) {}


  ngOnInit(): void {
    this.schoolingo.socketService.emit('messages::getMessages', {});
    moment.locale('cs');


    this.schoolingo.socketService.addFunction('messages::getMessages').subscribe((data: any) => {
      this.loadingMessages = false;
      console.log(data);
      this.messages = data;
    });
  }

  public selectMessage(id: number): void {
    this.selectedMessage = id;
    this.schoolingo.socketService.emit('messages::getMessage', { message: this.messages[id].messageId });
  }

  public loadingMessages: boolean = false;
  public messages: sentMessage[] = [
    {
      messageId: 1,
      tags: [0],
      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],
      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [1],
      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [0],
      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],
      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    },
    {
      messageId: 1,
      tags: [],

      receivers: [{
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      }],
      message: "aaaa",
      sent: moment(),
      sender: {
        firstName: "AAA",
        lastName: "BBB",
        gender: 0
      },
      type: 0,
      isRead: false
    }
  ];
  public message: string = '';
  public search = new FormControl('');

  public selectedMessage: number | undefined = undefined;

}
