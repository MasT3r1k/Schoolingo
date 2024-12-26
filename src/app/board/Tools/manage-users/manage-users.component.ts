import { Component, OnInit } from '@angular/core';
import { errorAPI } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { personDetails } from '@Schoolingo/User';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css', '../../../Styles/card.css']
})
export class ManageUsersComponent implements OnInit {
  private listeners: Subscription[] = [];
  public users: { personId: number, socketId: string }[] = [];

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
    this.schoolingo.socketService.emit('admin:getActiveClients');

    this.listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('admin:getActiveClients');
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("admin:getActiveClients").subscribe((data: any | errorAPI) => {
      if ('error' in data) {
        return;
      }

      this.users = [];

      data.forEach((user: any) => {
        let person: Record<number, personDetails> = {};
        person[user.person.personId] = user.person;
        this.schoolingo.addPersons(person);
        this.users.push({ personId: user.person.personId, socketId: user.socketId });
      });
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
