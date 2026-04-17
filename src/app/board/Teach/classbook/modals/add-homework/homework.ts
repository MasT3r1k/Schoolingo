import { Component, inject } from "@angular/core";
import { DropdownManager } from "@Schoolingo/dropdown";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { Classbook } from "@Schoolingo/classbook";
import { ModalManager } from "@Schoolingo/modal";
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
    public modalManager = inject(ModalManager);
    public classbook = inject(Classbook);
    public errors: any = {};
    public type: string = 'info';

    public assign_at = moment();
    public submit_at = moment().add(7, 'days');

    public openFiles(): void {
        this.modalManager.openModal('classbook_files', {
            files: this.classbook.files,
            origin: 'classbook',
            onAssign: (files: any) => {
                this.classbook.files = files;
            }
        });
    }

    // Calendar subscriptions are handled via (valueChange) in template
}