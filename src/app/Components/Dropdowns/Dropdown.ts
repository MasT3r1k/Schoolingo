import { NgClass, NgStyle } from "@angular/common";
import { Component, Injectable, OnInit } from "@angular/core";
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

    ngOnInit(): void {}

    public getDropdowns(): ContextMenu[] {
        return Object.values(dropdowns).filter((dropdown: ContextMenu) => dropdown.isOpen == true);
    }

    public create(id: string, data: ContextMenu): void {
        dropdowns[id] = data;
    }

    public open(id: string): void {
        let el: HTMLElement = document.querySelector("[dropdown='" + id + "']") as HTMLElement;
        let boundClientRect = el.getBoundingClientRect();
        dropdowns[id].position = [boundClientRect.x, boundClientRect.y + boundClientRect.height];
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