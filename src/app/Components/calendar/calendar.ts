import { Injectable } from "@angular/core";
import { CalendarComponent } from "./calendar.component";

@Injectable()
export class Calendar {

    constructor() {}

    private calendars: CalendarComponent[] = [];

    public addCalendar(calendar: CalendarComponent) {
        this.calendars.push(calendar);
    }

    public removeCalendar(calendar: CalendarComponent) {
        let id = this.calendars.indexOf(calendar);
        if (id == -1) return;
        this.calendars.splice(id, 1);
    }

    public getCalendar(name: string): CalendarComponent {
        return this.calendars.filter((cal: CalendarComponent) => cal.name == name)[0];
    }

}