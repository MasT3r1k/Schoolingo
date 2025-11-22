import { Component, inject } from "@angular/core";
import { Locale } from "@Schoolingo/locale";

@Component({
    imports: [],
    templateUrl: './homework.html',
    styleUrl: './homework.css'
})

export class HomeworkModal {
    public l = inject(Locale);
    public errors: any = {};
}