import { Schoolingo } from "@Schoolingo";
import { Locale } from "@Schoolingo/Locale";
import { SocketService } from "@Schoolingo/Socket";
import { Theme, themes } from "@Schoolingo/Theme";
import { Component } from "@angular/core";

@Component({
    selector: 'theme-selector',
    template: `<h2 class="small">{{ locale.getLocale('themeTitle') }}</h2>
<div class="alert alert-error" *ngIf="schoolingo.getOfflineMode()">
    <span>{{ locale.getLocale('offlineModeChange') }}</span>
</div>
<div class="select select-row">
    <div [ngClass]="{'select-option': true, active: theme.getTheme() == them}" (click)="selectTheme(them);" *ngFor="let them of theme.getThemes()">
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
        public locale: Locale,
        public schoolingo: Schoolingo,
        private socketService: SocketService
    ) {

        this.socketService.addFunction("updateUser").subscribe((data: any): void => {
            if (!data.message) return;
            if (data.status === 1) {
                switch(data.message) {
                    case "theme_changed":
                        if (data.theme === undefined) return;
                        this.theme.updateTheme(this.theme.getThemes()[data.theme]);
                    break;
                }
            }
        })

    }

    public selectTheme(them: themes): void {
        if (this.schoolingo.getOfflineMode()) {
            this.theme.updateTheme(them);
            return;
        }
        this.socketService.getSocket().Socket?.emit('updateUser', { type: 'theme', theme: this.theme.getThemes().indexOf(them) });
    }



}