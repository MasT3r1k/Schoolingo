import { Component, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { IconsModule } from '../../Modules/Icons.module';
import { Discord } from '@Schoolingo/Discord';
import { Modules } from '@Schoolingo/Modules';

@Component({
  standalone: true,
  imports: [IconsModule],
  templateUrl: './discord-connect.component.html',
  styleUrls: ['./discord-connect.component.css', '../../Styles/card.css', '../../Styles/input.css']
})
export class DiscordConnectComponent implements OnInit {

  constructor(
    public schoolingo: Schoolingo,
    public discord: Discord,
    public modules: Modules
  ) {}

  ngOnInit(): void {
    this.discord.loadData();
  }  

}
