import { NgClass, NgStyle } from "@angular/common";
import { Component, Input, OnInit, RendererFactory2 } from "@angular/core";
import { Locale } from "@Schoolingo/Locale";
import { randomstring } from "@Schoolingo/Utils";
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

    constructor(
        public locale: Locale,
        private factory: RendererFactory2
        ) {
            this.renderer = this.factory.createRenderer(window, null);
            this.renderer.listen(window, 'resize', () => {
                this.refreshGlider();
            });
        }

    name: string = randomstring(16);
    @Input() value: BehaviorSubject<number> = new BehaviorSubject(0);
    @Input() options: string[] = [];

    gliderStyles: Record<string, string | number> = {};
    public getGlider(): Record<string, string | number> {
        return this.gliderStyles;
    }



    ngOnInit(): void {

        setTimeout(() => {
            this.refreshGlider()
        })

        this.value.subscribe(() => {
            this.refreshGlider();
        }); 
        
    }


    public refreshGlider(): void {
        try {
            let tab: HTMLElement = document.querySelectorAll(".tabs#" + this.name + " .options .tab")?.[this.value.getValue() ?? 0] as HTMLElement;

            this.gliderStyles.width = tab.clientWidth;
            this.gliderStyles.height = tab.clientHeight;
            this.gliderStyles.transform = 'translate(' + tab.offsetLeft + 'px, ' + tab.offsetTop + 'px)';
        } catch(e) {}
    }

}