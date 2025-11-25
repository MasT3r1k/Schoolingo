import { Component, inject } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-midterm',
  imports: [TabsComponent],
  templateUrl: './midterm.component.html',
  styleUrl: './midterm.component.css'
})
export class MidtermComponent {
  public l = inject(Locale);
  public selectedTab = new BehaviorSubject(0);
  public options = ['marks.midterm.tabs.marks', 'marks.midterm.tabs.reports'];
}
