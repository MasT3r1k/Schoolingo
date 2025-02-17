import { NgClass, NgStyle } from "@angular/common";
import { Component, Input, OnInit, RendererFactory2 } from "@angular/core";
import { Alert } from "@Schoolingo/Alert";
import { Locale } from "@Schoolingo/Locale";
import { IconsModule } from "../../Modules/Icons.module";

@Component({
    selector: 'alert',
    templateUrl: './Alert.html',
    standalone: true,
    imports: [NgClass, IconsModule],
    styleUrl: './Alert.css'
})
export class AlertComponent implements OnInit {
    
    public renderer;

    constructor(
        public locale: Locale,
        private factory: RendererFactory2
        ) {
            this.renderer = this.factory.createRenderer(window, null);
        }

    @Input() alert!: Alert;

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.renderer.destroy();
    }
}