import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { UserService } from '@Schoolingo/User';

@Component({
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css', '../../boardv2.css']
})
export class SendComponent {
  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public userService: UserService
  ) {}

  public selectedReceivers: any[] = [];

  ngOnInit(): void {

  }

}
