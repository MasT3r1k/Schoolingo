import { Component, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { IconsModule } from '../../Modules/Icons.module';
import { Discord } from '@Schoolingo/Discord';
import { Modules } from '@Schoolingo/Modules';
import Swal, { SweetAlertTheme } from 'sweetalert2';

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

  public connectDiscord(): void {
    Swal.fire({
      customClass: {
        confirmButton: "blue-info",
        cancelButton: "red",
      },
      title: "Propojení s discord účtem",
      text: "Propojení probíhá mimo školu, škola nebude mít přístup k vašemu discord účtu ani informacím o něm.",
      icon: 'info',
      theme: this.schoolingo.theme.getThemeColor() as SweetAlertTheme,
      showCancelButton: true,
      confirmButtonText: "Propojit",
      cancelButtonText: "Zrušit",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Connecting to Discord...');
      }
    });
  }

}
