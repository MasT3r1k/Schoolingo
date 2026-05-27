import { NgClass, NgComponentOutlet } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ContextMenu } from "@Schoolingo/context-menu";
import { DropdownManager } from "@Schoolingo/dropdown";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { ModalManager } from "@Schoolingo/modal";

@Component({
    selector: 'schoolingo-modals',
    templateUrl: './modal.html',
    standalone: true,
    imports: [NgComponentOutlet, IconsModule, NgClass],
    styleUrl: './modal.css'
})

export class ModalComponent {
    public modalManager = inject(ModalManager);
    public dropdownManager = inject(DropdownManager)
    public l = inject(Locale);
    public context_menu = inject(ContextMenu)

    public getOverflowStyle(forceScrollbar: boolean = false, hiddenOverflow: boolean = true): string {
        if (forceScrollbar == true) return 'auto';
        if (hiddenOverflow == false) return 'visible';
        if (this.dropdownManager.selected_dropdown !== '') return 'visible';
        return 'hidden';
    }
}