import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { BehaviorSubject } from 'rxjs';
import * as utils from '@Schoolingo/Utils';
import { Dropdown } from '@Components/Dropdowns/Dropdown';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})
export class TimetableComponent {
  constructor(
    public schoolingo: Schoolingo,
    public dropdown: Dropdown
    ) {}

  // Imports
  utils = utils;

  // Select Week Tab
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);

  // Dropdown Timetable Options
  public timetableOptionsName: string = 'timetableOptions';


  ngOnInit(): void {

    // Select Week Tab
    this.selectedTab.subscribe((id: number) => {
      let arrayWeek: number[] = [this.schoolingo.todayWeek, this.schoolingo.todayWeek + 1, -1, this.schoolingo.todayWeek];
      this.schoolingo.timetableSelectedWeek.next(arrayWeek[id]);
    })

    this.dropdown.create(this.timetableOptionsName, { title: '', isOpen: false, items: [
      {
        label: 'timetable/print',
        type: 'function',
        func: () => {},
        isActive: true
      }, {
        label: 'Zobrazit učitele',
        type: 'function',
        func: () => {},
        isActive: true
      }, {
        label: 'Zobrazit třídu',
        type: 'function',
        func: () => {},
        isActive: true
      }, {
        label: 'Zobrazit místnost',
        type: 'function',
        func: () => {},
        isActive: true
      }]
    });
  }
}
