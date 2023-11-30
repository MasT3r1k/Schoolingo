import { Component, Input, OnInit } from '@angular/core';
import { Tabs } from './Tabs';
import { Router } from '@angular/router';

@Component({
  selector: 'schoolingo-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent implements OnInit {

  private routerSub;

  constructor(
    private tabs: Tabs,
    private router: Router
  ) {
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (url?.routerEvent || (url?.code === 0 && url?.type == 16)) return;

      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || (url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login')) { return; }

      this.tabs.createTab(this.name, this.options, this.getValue()); // Fix: Removing all tabs on router change to same page

    });
  }

  @Input() name: string = '';
  @Input() options: string[] = [];

  ngOnInit(): void {
    this.tabs.createTab(this.name, this.options, 0);
    
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  public getGlider(): { width: number, offset: number } {

    return this.tabs.getTabGlider(this.name);
  }

  public getValue(): number {
    return this.tabs.getTabValue(this.name);
  }

  public selectTab(id: number): void {
    this.tabs.setTabValue(this.name, id);
 }

}
