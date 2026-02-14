import { Component, inject } from "@angular/core";
import { DropdownManager } from "@Schoolingo/dropdown";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { CalendarComponent } from "@Components/calendar";
import { CalendarManager } from "@Components/calendar-dropdown";
import moment from "moment";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    imports: [IconsModule, CalendarComponent, CommonModule, FormsModule],
    templateUrl: './homework.html',
    styleUrl: './homework.css'
})

export class HomeworkModal {
    public l = inject(Locale);
    public dropdownManager = inject(DropdownManager);
    public calendarManager = inject(CalendarManager);
    public errors: any = {};
    public type: string = 'info';

    public assign_at = moment().format('YYYY-MM-DD');
    public submit_at = moment().add(7, 'days').format('YYYY-MM-DD');

    ngOnInit(): void {
        setTimeout(() => {
            this.calendarManager.getCalendarData('homework_assign_at').selected_date[0].next(moment(this.assign_at));
            this.calendarManager.getCalendarData('homework_submit_at').selected_date[0].next(moment(this.submit_at));
        });

        this.calendarManager.getCalendarData('homework_assign_at').selected_date[0].subscribe((date) => {
            this.assign_at = date.format('YYYY-MM-DD');
        });
        this.calendarManager.getCalendarData('homework_submit_at').selected_date[0].subscribe((date) => {
            this.submit_at = date.format('YYYY-MM-DD');
        });
    }
}