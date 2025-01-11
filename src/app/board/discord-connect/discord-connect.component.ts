import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { IconsModule } from '../../Modules/Icons.module';

@Component({
  standalone: true,
  imports: [IconsModule],
  templateUrl: './discord-connect.component.html',
  styleUrls: ['./discord-connect.component.css', '../../Styles/card.css', '../../Styles/input.css']
})
export class DiscordConnectComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  

}
