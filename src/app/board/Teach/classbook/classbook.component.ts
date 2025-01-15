import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { Schoolingo } from '@Schoolingo';
import { IconsModule } from '../../../Modules/Icons.module';
import { BehaviorSubject } from 'rxjs';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [NgClass, IconsModule],
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})
export class ClassbookComponent implements OnInit {
  public calendarCalendarName = 'classbookCalendar';
  public selectedDate: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  constructor(
    public schoolingo: Schoolingo,
    public dropdown: Dropdown
  ) {}

  ngOnInit(): void {
    // Calendar
    this.dropdown.create(this.calendarCalendarName, { title: '', isOpen: false, items: [{
      type: 'calendar',
      date: this.selectedDate,
      selectedMonth: this.selectedDate.getValue().clone(),
      isActive: true
    }] });

    this.selectedDate.next(moment());
  }

    ngOnDestroy(): void {
      this.selectedDate.next(moment());
  
      this.dropdown.remove(this.calendarCalendarName);
    }

}
