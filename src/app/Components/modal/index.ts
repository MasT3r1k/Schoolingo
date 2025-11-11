import { NgComponentOutlet } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ContextMenu } from "@Schoolingo/context-menu";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { ModalManager } from "@Schoolingo/modal";

@Component({
    selector: 'schoolingo-modals',
    templateUrl: './modal.html',
    standalone: true,
    imports: [NgComponentOutlet, IconsModule],
    styleUrl: './modal.css'
})

export class ModalComponent {
    public modalManager = inject(ModalManager);
    public l = inject(Locale);
    public context_menu = inject(ContextMenu)
}