import { Locale } from "@Schoolingo/Locale";
import { Theme } from "@Schoolingo/Theme";
import { Component } from "@angular/core";

@Component({
    selector: 'theme-selector',
    template: `<div class="select select-row">
    <div [ngClass]="{'select-option': true, active: theme.getTheme() == them}" (click)="theme.updateTheme(them);" *ngFor="let them of theme.getThemes()">
        <div class="left">
            <div class="column">
                <div class="preview">
                    <div [ngClass]="['wrapper', (them == 'system') ? (theme.getSystemColor() == 'dark') ? 'dark' : 'light' : them]">
                        <div class="header" style="height: 48px"></div>
                        <div class="content">
                            <div class="sidebar" style="height: 100vh;width: 100px"></div>
                            <div class="main-content">
                                <div class="box">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    {{ locale.getLocale("themes/" + them) + ((them == 'system') ? (theme.getSystemColor() == 'dark') ? ' (' + locale.getLocale("themes/dark") + ')' : ' (' + locale.getLocale("themes/light") + ')' : '') }}
                </div>
            </div>
        </div>
    </div>
</div>`,
    styleUrls: ['../../../board.css', '../../../board.component.css', './theme.component.css']
})

export class ThemeComponent {
    constructor(
        public theme: Theme,
        public locale: Locale
    ) {}
}