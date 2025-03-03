import { NgClass, NgComponentOutlet } from '@angular/common';
import { Component, Type } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Locale } from '@Schoolingo/Locale';
import { BehaviorSubject } from 'rxjs';
import { Module, MainModules } from './Modules/Modules';
import { ModuleTitle } from './Modules/Modules';
import { Permission } from '@Schoolingo/Permissions';
import { IconsModule } from '../../Modules/Icons.module';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink, TabsComponent, NgClass, NgComponentOutlet, IconsModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', '../../Styles/item.css']
})
export class MainComponent {
  constructor(
    public locale: Locale,
    public dropdown: Dropdown,
    public modules: MainModules,
    public permissions: Permission
  ) {}

  public getComponent(module: Module): Type<any> | null {
    if (Array.isArray(module.component)) {
      return module.component[module.selectedTab.getValue()];
    }
    return module.component;
  }

  public getTitles(module: Module): string[] {
    let titles: string[] = [];
    module.titles.forEach((title: ModuleTitle): void => {
      titles.push(title.title);
    })
    return titles;
  }

  // Timetable module
  public timetableSelectedTab = new BehaviorSubject<number>(0);
  public timetableOptionsName = 'timetableOptions';
}
