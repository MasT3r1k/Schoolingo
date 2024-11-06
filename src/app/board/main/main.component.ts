import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Locale } from '@Schoolingo/Locale';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink, TabsComponent, NgClass],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', '../../Styles/item.css']
})
export class MainComponent {
  constructor(
    public locale: Locale,
    public dropdown: Dropdown
  ) {}


  // Timetable module
  public timetableSelectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  public timetableOptionsName: string = 'timetableOptions';
  

}
