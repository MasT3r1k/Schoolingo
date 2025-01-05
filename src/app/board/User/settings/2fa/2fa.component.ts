import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Schoolingo } from "@Schoolingo";
import { QRCodeModule } from "angularx-qrcode";

@Component({
  standalone: true,
  imports: [QRCodeModule, FormsModule, ReactiveFormsModule],
  templateUrl: './2fa.component.html',
  styleUrls: ['./2fa.component.css', '../../../../Styles/card.css', '../../../../Styles/input.css']
})

export class TFAComponent {
    constructor(
        public schoolingo: Schoolingo
    ) {}

    public token = '';

    public verifyToken(): void {
        if (this.token.length != 6) return;

        this.schoolingo.socketService.emit('main:updateUser', { type: '2fa', enabled: true, token: this.token });
    }
}