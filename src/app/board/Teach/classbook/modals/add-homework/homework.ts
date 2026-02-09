import { Component, inject } from "@angular/core";
import { DropdownManager } from "@Schoolingo/dropdown";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";

@Component({
    imports: [IconsModule],
    templateUrl: './homework.html',
    styleUrl: './homework.css'
})

export class HomeworkModal {
    public l = inject(Locale);
    public dropdownManager = inject(DropdownManager);
    public errors: any = {};
    public type: string = 'info';
}