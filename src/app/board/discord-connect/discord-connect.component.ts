import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './discord-connect.component.html',
  styleUrls: ['./discord-connect.component.css', '../../Styles/card.css', '../../Styles/input.css']
})
export class DiscordConnectComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  

}
