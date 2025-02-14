import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { IconsModule } from '../../../Modules/Icons.module';

enum ThreadTypes {
  MESSAGE,
  HOMEWORK,
  EXCUSESTUDENT,
  RATESTUDENT,
  SYSTEM
}

type Message = {
  messageId: number;
  message: string;
  date: moment.Moment;
} & ({
  type: 'member';
  author: number;
} | {
  type: 'system'
})

interface Thread {
  threadId: number;
  author: number;
  type: ThreadTypes;
  memberTypes: number[];
  members: number[];
  tags: [];
  date: moment.Moment;
  newMessage: boolean;
  message: string;
}

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, NgStyle, IconsModule],
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.css', '../../../Styles/card.css', '../../../Styles/input.css', '../../../Styles/item.css']
})
export class ReceivedComponent implements OnInit {
  public types: string[] = ["hsl(206deg, 90%, 50%)", "hsl(94, 54%, 38%)", "hsl(25, 100%, 47%)"];

  public selectedTab = new BehaviorSubject(2);
  public selectedThread = -1;
  constructor(public schoolingo: Schoolingo) {}

  ThreadTypes = ThreadTypes;

  public threads: Thread[] = [
    {
      threadId: 1,
      author: 1,
      members: [1],
      memberTypes: [0],
      type: ThreadTypes.MESSAGE,
      tags: [],
      newMessage: true,
      date: moment(),
      message: "aaabbbccc"
    },
    {
      threadId: 1,
      author: 1,
      members: [1],
      memberTypes: [0],
      type: ThreadTypes.MESSAGE,
      tags: [],
      newMessage: true,
      date: moment(),
      message: "aaabbbccc"

    },
    {
      threadId: 1,
      author: 1,
      type: ThreadTypes.HOMEWORK,
      memberTypes: [0,1,2],
      members: [1],
      tags: [],
      newMessage: false,
      date: moment(),
      message: "aaaabbbccccxsss"
    },
    {
      threadId: 1,
      author: 1,
      members: [1],
      type: ThreadTypes.SYSTEM,
      memberTypes: [0],
      tags: [],
      newMessage: false,
      date: moment(),
      message: "Poslední zpráva, kterou jste přečetla, byla smazána"
    },
    {
      threadId: 1,
      author: 1,
      type: ThreadTypes.EXCUSESTUDENT,
      members: [1],
      memberTypes: [0],
      tags: [],
      newMessage: false,
      date: moment(),
      message: "Prosím o omluvení syna z dnešního vyučování"
    },
    {
      threadId: 1,
      author: 1,
      members: [1],
      type: ThreadTypes.HOMEWORK,
      memberTypes: [0],
      tags: [],
      newMessage: false,
      date: moment(),
      message: "aaabbbccc"
    },
  ];

  ngOnInit(): void {
    this.getBackground(this.threads[2]);
  }

  public getBackground(thread: Thread): string {
    let bg = this.types[thread.memberTypes[0]] + " " + (100 / thread.memberTypes.length).toFixed(2) + "%";
    for(let i = 1;i < thread.memberTypes.length;i++) {
      bg += ", " + this.types[thread.memberTypes[i]] + " " + (100 / thread.memberTypes.length * (i)).toFixed(2) + "% " + (100 / thread.memberTypes.length * (i + 1)).toFixed(2) + "%"
    }
    bg = "linear-gradient(" + bg + ")"
    return bg;
  }
}
