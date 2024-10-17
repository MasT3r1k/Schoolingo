import { NgClass, NgStyle } from "@angular/common";
import { Component, Injectable, OnInit, RendererFactory2 } from "@angular/core";
import { ContextButton, ContextButtonRightText, ContextMenu } from "./Dropdown.d";
import { Locale } from "@Schoolingo/Locale";
import { SafeHtml } from "@angular/platform-browser";

//! DON'T IMPORT THIS INTO SPECIFIC COMPONENTS, ITS ALREADY IN THE MAIN COMPONENT

let dropdowns: Record<string, ContextMenu> = {};

@Component({
    selector: 'schoolingo-dropdowns',
    templateUrl: './Dropdown.html',
    standalone: true,
    imports: [NgClass, NgStyle],
    styleUrl: './Dropdown.css'
})

@Injectable()
export class Dropdown implements OnInit {

    public renderer;

    constructor(
        public locale: Locale,
        private factory: RendererFactory2
        ) {
            this.renderer = this.factory.createRenderer(window, null);
            this.renderer.listen(window, 'resize', () => {
                Object.keys(dropdowns).forEach((id: string) => this.refreshPosition(id));
            });
        }

    ngOnInit(): void {
    }

    public formatRightText(text: ContextButtonRightText): SafeHtml {
        let html: SafeHtml = "";
        if (text == "arrow") { }
        text.split(' ').forEach((word: string) => {
            if (word.startsWith("[key:") && word.endsWith(']')) {
                let key = word.slice(5, -1);
                html += "<div class='key'>" + key + "</div>";
            }
        })
        return html;
    }

    public getDropdowns(): [string, ContextMenu][] {
        return Object.entries(dropdowns);
    }

    public refreshPosition(id: string): void {
        let btn: HTMLElement = document.querySelector("[dropdown='" + id + "']") as HTMLElement;
        let dropdown: HTMLElement = document.querySelector(".dropdown[id='" + id + "']") as HTMLElement;
        if (!btn) return;
        if (!dropdown) return;
        let boundClientRectBtn = btn.getBoundingClientRect();
        let boundClientRectDropdown = dropdown.getBoundingClientRect();
        let maxX = document.body.clientWidth - boundClientRectDropdown.width - 16;
        let x = boundClientRectBtn.x;
        // Check borders
        if (x > maxX) {
            x = maxX;
        }
        if (x < 0) {
            x = 0;
        }
        dropdowns[id].position = [x, boundClientRectBtn.y + boundClientRectBtn.height + 2];
    }

    public create(id: string, data: ContextMenu): void {
        dropdowns[id] = data;
        this.refreshPosition(id);
    }

    public clickEvent(dropdown: string, itemId: number): void {
        let item: ContextButton = dropdowns[dropdown].items[itemId];
        if (!item) return;
        switch(item.type) {
            case "function":
                item.func();
                break;
            case "toggle":
                item.value.next(!item.value.getValue());
                break;
        }
    }

    public toggle(id: string): void {
        if (dropdowns[id].isOpen === true) {
            return this.close(id);
        }
        return this.open(id);
    }

    public open(id: string): void {
        this.refreshPosition(id);
        dropdowns[id].isOpen = true;
    }

    public close(id: string): void {
        dropdowns[id].isOpen = false;
    }

    public closeAll(): void {
        Object.values(dropdowns).forEach((dropdown: ContextMenu) => dropdown.isOpen = false);
    }
}