import { Schoolingo } from "@Schoolingo";
import { Locale } from "@Schoolingo/Locale";
import { themes } from "@Schoolingo/Theme";
import { NgClass } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'theme-selector',
    standalone: true,
    imports: [NgClass],
    templateUrl: './theme.html',
    styleUrls: ['../../../board.component.css', './theme.css']
})

export class ThemeSelector {
    constructor(
        public locale: Locale,
        public schoolingo: Schoolingo
    ) {}

    public selectTheme(them: themes): void {
        if (this.schoolingo.getOfflineMode()) {
            this.schoolingo.theme.updateTheme(them);
            return;
        }
        this.schoolingo.socketService.emit(
            'main:updateUser',
            {
                type: 'theme',
                theme: this.schoolingo.theme.getThemes().indexOf(them)
            }
        );
    }



}