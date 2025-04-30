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
import confetti from "canvas-confetti";

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

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

  public testconfetti(): void {
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    var interval: NodeJS.Timeout = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, zIndex: 5, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, zIndex: 5, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
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
