import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'qr-code',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css']
})
export class QrCodeComponent {
  @Input({ required: true }) data: string = '';
  @Input() size: number = 224;
  @Input() icon: string = './assets/logo/login_black_100.webp';
  @Input() iconSize: number = 50;
  @Input() errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'L';
  @Input() margin: number = 2;
  @Input() showScanner: boolean = true;
  @Input() showBox: boolean = true;
  @Input() colorDark: string = '#000000';
  @Input() colorLight: string = '#ffffff';
}
