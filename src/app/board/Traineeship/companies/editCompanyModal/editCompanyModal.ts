import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TabsComponent, NgClass],
  templateUrl: './editCompanyModal.html',
  styleUrls: ['../../../../Styles/input.css', './editCompanyModal.css']
})
export class editCompanyModalComponent {
  public showSelect: 'responsiblePerson' | null = null;
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    public schoolingo: Schoolingo
  ) {}
}
