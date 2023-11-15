import { Injectable } from "@angular/core";

type Tab = {
    name: string;
    options: string[];
    selected: number;
    onChange?: Function;
    glider: { width: number, offset: number };
}

@Injectable({providedIn: 'root'})
export class Tabs {
    constructor(
    ) {
        window.addEventListener('resize', () => {
            try {
              let _ = document?.querySelectorAll(".tabs div.tab.active") as NodeListOf<Element>;
              _.forEach((__: HTMLElement | any) => {
                let ___ = this.tabs.filter(____ => ____.name == __.id)[0];
                if (!___) return;
                ___.glider = {
                    width: __?.clientWidth || 0,
                    offset: __?.offsetLeft - parseInt(window?.getComputedStyle(__?.parentElement as HTMLElement)?.getPropertyValue('padding-left')) ?? 0,
                }
              })
            } catch(e) {
              console.error(e);
            }
        })
    }

    private tabs: Tab[] = [];

    generateRandomTabName(): string {
        let outString: string;
        let inOptions: string;

        do {
            outString = '';
            inOptions = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
            for (let i = 0; i < 12; i++) {
              outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
            }
        } while (this.tabs.filter(_ => _.name == outString).length > 0)

        return outString;
    }

    createTab(name: string = this.generateRandomTabName(), options: string[], value: number = 0): void {

        if (this.tabs.filter(_ => _.name == name).length > 0) return console.error('Duplicate tab (' + name + ') detected!');
        this.tabs.push(
            { 
                name,
                options,
                selected: value,
                glider: { width: 0, offset: 0 }
             }
        );
        this.setTabValue(name, value);
    }

    setTabValue(tab: string, value: number): void {
        let tTab: Tab = this.tabs.filter(_ => _.name == tab)?.[0];
        if (!tTab) return;

        if (value >= tTab.options.length) return;

        tTab.selected = value;

        try {
            if (tTab?.onChange) {
                tTab.onChange(value);
            }
        } catch(e) {
            console.error(e);
        }
    
        setTimeout(() => {
          try {
            let _ = document?.querySelector(".tabs#" + tab + " div.tab.active") as HTMLElement;
            if (!_) return;
            tTab.glider = {
              width: _?.clientWidth || 0,
              offset: _?.offsetLeft - parseInt(window?.getComputedStyle(_?.parentElement as HTMLElement)?.getPropertyValue('padding-left')) ?? 0
            };
          } catch(e) {
            console.error(e);
          }
        })
    }

    removeTab(tab: string): void {
      let tTab: Tab = this.tabs.filter(_ => _.name == tab)?.[0];
      if (!tTab) return;
      this.tabs.splice(this.tabs.indexOf(tTab), 1);
    }

    clearTabs(): void {
      this.tabs = [];
    }

    setOnChangeFunc(tab: string, fun: Function): void {
        let tTab: Tab = this.tabs.filter(_ => _.name == tab)?.[0];
        if (!tTab) return console.error('Tab not found.');
        tTab.onChange = (index: number) => fun(index);
    }

    getTabValue(tab: string): number {
        let f_ = this.tabs.filter(_ => _.name == tab);
        if (f_.length == 0) return 0;
        return f_[0].selected;
    }

    getTabGlider(tab: string): any {
      let f_ = this.tabs.filter(_ => _.name == tab);
      if (f_.length == 0) return { width: 0, offset: 0 };
      return f_[0].glider;
    }


}