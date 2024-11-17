import { NgClass, NgStyle } from "@angular/common";
import { Component, Injectable, OnInit, RendererFactory2 } from "@angular/core";
import { Calendar, ContextButton, ContextButtonRightText, ContextMenu } from "./Dropdown.d";
import { Locale } from "@Schoolingo/Locale";
import { SafeHtml } from "@angular/platform-browser";
import moment from "moment";
import { Logger } from "@Schoolingo/Logger";
export { ContextButton, ContextButtonRightText, ContextMenu }

//! DON'T IMPORT THIS INTO SPECIFIC COMPONENTS, ITS ALREADY IN THE MAIN COMPONENT

let dropdowns: Record<string, ContextMenu> = {};

@Component({
    selector: 'schoolingo-dropdowns',
    templateUrl: './Dropdown.html',
    standalone: true,
    imports: [NgClass, NgStyle],
    styleUrls: ['./Dropdown.css']
})

@Injectable()
export class Dropdown {

    public renderer;

    constructor(
        public locale: Locale,
        private factory: RendererFactory2,
        private logger: Logger
    ) {
        this.renderer = this.factory.createRenderer(window, null);
        this.renderer.listen(window, 'resize', () => {
            Object.keys(dropdowns).forEach((id: string) => this.refreshPosition(id));
        });
    }

    ngOnDestroy(): void {
        this.renderer.destroy();
    }

    // Item format
    public formatRightText(text: ContextButtonRightText): SafeHtml {
        let html: SafeHtml = "";
        if (text == "arrow") { }
        text.split(' ').forEach((word: string) => {
            if (word.startsWith("[key:") && word.endsWith(']')) {
                let key = word.slice(5, -1);
                html += "<div class='key'>" + key + "</div>";
            }
        })
        return html;
    }

    public formatHtmlText(text: string): SafeHtml {
        let html: SafeHtml = "";
        if (text == "arrow") { }
        text.split(' ').forEach((word: string) => {
            if (word.startsWith("[l:") && word.endsWith(']')) {
                let key = word.slice(3, -1);
                html += this.locale.getLocale(key);
            } else {
                html += word + " ";
            }
        })
        return html;
    }

    //
    public getDropdowns(): [string, ContextMenu][] {
        return Object.entries(dropdowns);
    }

    public refreshPosition(id: string): void {
        let btn: HTMLElement = document.querySelector("[dropdown='" + id + "']") as HTMLElement;
        let dropdown: HTMLElement = document.querySelector(".dropdown[id='" + id + "']") as HTMLElement;
        if (!btn) return;
        if (!dropdown) return;
        let boundClientRectBtn = btn.getBoundingClientRect();
        let boundClientRectDropdown = dropdown.getBoundingClientRect();
        let maxX = document.body.clientWidth - boundClientRectDropdown.width - 16;
        let x = boundClientRectBtn.x - (boundClientRectDropdown.width - boundClientRectBtn.width) / 2;
        // Check borders
        if (x > maxX) {
            x = maxX;
        }
        if (x < 0) {
            x = 0;
        }
        dropdowns[id].position = [x, boundClientRectBtn.y + boundClientRectBtn.height + 2];
    }

    public create(id: string, data: ContextMenu): boolean {
        if (dropdowns[id]) {
            return false;
        }
        dropdowns[id] = data;
        this.refreshPosition(id);
        return true;
    }

    public remove(id: string): boolean {
        if (!dropdowns[id]) {
            return false;
        }
        delete dropdowns[id];
        return true;
    }

    public clickEvent(dropdown: string, itemId: number): void {
        let item: ContextButton = dropdowns[dropdown].items[itemId];
        if (!item) return;
        switch(item.type) {
            case "function":
                item.func();
                break;
            case "toggle":
                item.value.next(!item.value.getValue());
                break;
        }
    }

    // Calendar
    public getCalendar(date: moment.Moment): Calendar[] {
        let calendar: Calendar[] = [];
        let startMonth = date.clone().startOf('month');

        // Before month
        for(let i = startMonth.day() ? startMonth.day() - 1 : 6;i > 0;i--) {
            let day = startMonth.clone().subtract(i, 'day');
            calendar.push({
                date: day,
                gray: true
            })
        }

        // Month
        for(let i = 0;i < startMonth.daysInMonth();i++) {
            let day = startMonth.clone().add(i, 'day');
            calendar.push({
                date: day,
                gray: false
            })
        }

        // After month
        let endMonth = startMonth.clone().endOf('month');
        for(let i = 1;i < (endMonth ? 8 - endMonth.day() : 6);i++) {
            let day = endMonth.clone().add(i, 'day');
            calendar.push({
                date: day,
                gray: true
            })
        }

        return calendar;
    }

    // Functions
    public toggle(id: string): void {
        if (!dropdowns[id]) {
            return this.logger.send("Dropdown", "Dropdown #" + id + " is not found.");
        }
        if (dropdowns[id].isOpen === true) {
            return this.close(id);
        }
        return this.open(id);
    }
    
    public isOpen(id: string): boolean {
        return dropdowns?.[id]?.isOpen;
    }

    public open(id: string): void {
        this.closeAll();
        this.refreshPosition(id);
        if (!dropdowns[id]) {
            return this.logger.send("Dropdown", "Dropdown #" + id + " is not found.");
        }
        dropdowns[id].isOpen = true;
    }

    public close(id: string): void {
        dropdowns[id].isOpen = false;
    }

    public closeAll(): void {
        Object.values(dropdowns).forEach((dropdown: ContextMenu) => dropdown.isOpen = false);
    }
}