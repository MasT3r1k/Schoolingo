import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconsModule } from '../../../Modules/Icons.module';
import { Utils } from '@Schoolingo/Utils';

enum messageTypes {
  MESSAGE,
  HOMEWORK,
  EXCUSESTUDENT,
  RATESTUDENT,
  SYSTEM
}

type Message = {
  messageId: number;
  message: string;
  sent: moment.Moment;
  deleted: boolean;
  isRead?: boolean;
  isConfirmed?: boolean;
  type: messageTypes;
  author: number;
  requireConfirm: boolean;
}

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, NgStyle, IconsModule],
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.css', '../../../Styles/card.css', '../../../Styles/input.css', '../../../Styles/item.css']
})
export class ReceivedComponent implements OnInit {
  public types: string[] = ["hsl(206deg, 90%, 50%)", "hsl(94, 54%, 38%)", "hsl(25, 100%, 47%)"];
  private listeners: Subscription[] = [];
  public Utils = Utils;

  public selectedTab = new BehaviorSubject<number>(2);
  public selectedMessage = -1;
  constructor(
    public schoolingo: Schoolingo
  ) {}

  messageTypes = messageTypes;

  public messages: Message[] = [];

  ngOnInit(): void {

    this.listeners.push(
      this.schoolingo.socketService.addFunction("messages:getMessages").subscribe((data: Message[]) => {
        console.log(data);
        data.forEach((message => {
          message.sent = moment(message.sent);
          if (message.type == messageTypes.MESSAGE) {
            message.isRead = message.isRead ?? false;
            message.isConfirmed = message.isConfirmed ?? false;
          }
          if (message.type == messageTypes.SYSTEM) {
            message.author = -1;
          }
        }))
        this.messages = data;
      })
    )

    this.listeners.push(
      this.schoolingo.socketService.addFunction("connect").subscribe(() => {
        let tab = this.selectedTab.getValue();
        let from = [moment().startOf('week'), moment().startOf('month'), this.schoolingo.school.schoolYear.start, null];
        let to = [moment().endOf('week'), moment().endOf('month'), this.schoolingo.school.schoolYear.end, this.schoolingo.school.schoolYear.start];

        this.schoolingo.socketService.emit("messages:getMessages", { type: 'received', from: from[tab], to: to[tab] });
      })
    )

    this.listeners.push(
      this.selectedTab.subscribe((tab: number) => {
        this.selectedMessage = -1;
        let from = [moment().startOf('week'), moment().startOf('month'), this.schoolingo.school.schoolYear.start, null];
        let to = [moment().endOf('week'), moment().endOf('month'), this.schoolingo.school.schoolYear.end, this.schoolingo.school.schoolYear.start];
        this.schoolingo.socketService.emit("messages:getMessages", { type: 'received', from: from[tab], to: to[tab] });
      })
    );
  }

  public getAuthor(): string {
    return this.messages[this.selectedMessage].author == -1 ? this.schoolingo.locale.getLocale("system") : this.schoolingo.formatPerson(this.messages[this.selectedMessage].author);
  }

  ngOnDestroy(): void {
    this.listeners.forEach((listen: Subscription) => listen.unsubscribe());
  }

  public getBackground(message: Message): string {
    // let bg = this.types[memberTypes[0]] + " " + (100 / thread.memberTypes.length).toFixed(2) + "%";
    // for(let i = 1;i < thread.memberTypes.length;i++) {
    //   bg += ", " + this.types[thread.memberTypes[i]] + " " + (100 / thread.memberTypes.length * (i)).toFixed(2) + "% " + (100 / thread.memberTypes.length * (i + 1)).toFixed(2) + "%"
    // }
    // bg = "linear-gradient(" + bg + ")"
    return "";
  }
}
