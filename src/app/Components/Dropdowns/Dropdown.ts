import { NgClass, NgStyle } from "@angular/common";
import { Component, Injectable, OnInit, RendererFactory2 } from "@angular/core";
import { ContextMenu } from "./Dropdown.d";

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
        private factory: RendererFactory2
        ) {
            this.renderer = this.factory.createRenderer(window, null);
            this.renderer.listen(window, 'resize', () => {
                Object.keys(dropdowns).forEach((id: string) => this.refreshPosition(id));
            });
        }

    ngOnInit(): void {
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
        let maxX = document.body.clientWidth - boundClientRectDropdown.width - 5;
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

    public open(id: string): void {
        this.refreshPosition(id);
        dropdowns[id].isOpen = true;
    }

    public close(id: string): void {
        dropdowns[id].isOpen = false;
    }

    public toggle(id: string): void {
        if (dropdowns[id].isOpen === true) {
            return this.close(id);
        }
        return this.open(id);
    }

    public closeAll(): void {
        Object.values(dropdowns).forEach((dropdown: ContextMenu) => dropdown.isOpen = false);
    }
}