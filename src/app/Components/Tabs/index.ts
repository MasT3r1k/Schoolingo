import { NgClass, NgStyle } from "@angular/common";
import { Component, inject, Input, OnInit, RendererFactory2 } from "@angular/core";
import { Locale } from "@Schoolingo/locale";
import { Utils } from "@Schoolingo/utils";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'schoolingo-tabs',
    templateUrl: './Tabs.html',
    standalone: true,
    imports: [NgClass, NgStyle],
    styleUrl: './Tabs.css'
})
export class TabsComponent implements OnInit {
    
    public renderer;
    public l = inject(Locale);

    constructor(
        private factory: RendererFactory2
    ) {
        this.renderer = this.factory.createRenderer(window, null);
    }

    name: string = Utils.randomstring(16, false);
    @Input() value: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    @Input() options: string[] = [];
    @Input() no_bottom_radius: boolean = false;
    @Input() option_width!: string;

    public gliderStyles: Record<string, string | number> = {};
    public getGlider(): Record<string, string | number> {
        return this.gliderStyles;
    }

    public getWidth(): string {
        if (this.option_width) {
            if (this.option_width == 'fit') {
                return (100 / this.options.length) + '%';
            }
            return this.option_width;
        }
        return '';
    }


    ngOnInit(): void {

        this.renderer.listen(window, 'resize', () => {
            setTimeout(() => {
                this.refreshGlider()
            })
        });

        setTimeout(() => {
            this.refreshGlider()
        })

        this.value.subscribe(() => {
            this.refreshGlider();
        });

        this.l.getLocaleData().subscribe(() => {
            setTimeout(() => this.refreshGlider(), 10)
        });
        
    }

    ngAfterContentInit(): void {
        this.refreshGlider();
    }

    ngOnDestroy(): void {
        this.renderer.destroy();
    }

    public refreshGlider(): void {
        try {
            let tab = document.querySelectorAll(".tabs#" + this.name + " .options .tab")[this.value.getValue() || 0] as HTMLElement;
            if (!tab) return;
            
            this.gliderStyles["width"] = tab.clientWidth - 8; 
            this.gliderStyles["height"] = tab.clientHeight;
            this.gliderStyles["transform"] = 'translateX(' + tab.offsetLeft + 'px)';
        } catch(err) {
            console.error(err);
        }
    }

}