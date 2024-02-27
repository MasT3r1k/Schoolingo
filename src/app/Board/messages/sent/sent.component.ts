import { Locale } from '@Schoolingo/Locale';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

type sentMessage = {
  receivers: any[];
  message: string;
  sent: Date;
}

@Component({
  templateUrl: './sent.component.html',
  styleUrls: ['../../board.css', '../../../input.css',  './sent.component.css']
})
export class SentComponent {
  constructor(
    public locale: Locale
  ) {}

  private messages: sentMessage[] = [];
  public message: string = '';
  public search = new FormControl('');

}
