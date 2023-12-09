import { Injectable } from "@angular/core";
import { CalendarComponent } from "./calendar.component";

@Injectable()
export class Calendar {

    constructor() {}

    private calendars: CalendarComponent[] = [];

    public addCalendar(calendar: CalendarComponent) {
        this.calendars.push(calendar);
    }


}