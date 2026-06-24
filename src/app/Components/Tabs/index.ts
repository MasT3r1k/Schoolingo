import { Component, inject, Input } from "@angular/core";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { Utils } from "@Schoolingo/utils";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'schoolingo-tabs',
    templateUrl: './Tabs.html',
    standalone: true,
    imports: [IconsModule],
    styleUrl: './Tabs.css'
})
export class TabsComponent {
    public l = inject(Locale);

    constructor() {}

    name: string = Utils.randomstring(16, false);
    @Input() icons: (string | null)[] = [];
    @Input() value = new BehaviorSubject<number>(0);
    @Input() options: string[] = [];
    @Input() prefix: string = '';
    @Input() no_bottom_radius = false;
    @Input() option_width!: string;
    @Input() theme: 'custom' | 'default' = 'default';
    
    public getWidth(): string {
        if (this.option_width) {
            if (this.option_width == 'fit') {
                return (100 / this.options.length) + '%';
            }
            return this.option_width;
        }
        return '';
    }
}