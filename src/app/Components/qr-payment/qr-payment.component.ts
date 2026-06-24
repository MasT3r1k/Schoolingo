import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { QrCodeComponent } from '@Components/qr-code/qr-code.component';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'qr-payment',
  standalone: true,
  imports: [CommonModule, QrCodeComponent],
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.css']
})
export class QrpaymentComponent {
  @Input() msg: string = '';
  @Input() account_number: string = '0';
  @Input() bank_code: string = '0';
  @Input() amount: number = 0;
  @Input() currency: 'CZK' = 'CZK';
  @Input() vs: string = '0';
  @Input() ss: string = '0';
  @Input() ks: string = '0';

  public getQR(): string {
    return this.generujQrPlatbu(this.account_number, this.bank_code, this.amount, this.vs, this.ss, this.ks)
  }

  public generujQrPlatbu(cisloUctu: string, kodBanky: string, castka: number, vs = '', ss = '', ks = '', msg = '') {
      const iban = this.prevedNaCesiIban(cisloUctu, kodBanky);
      
      let qrString = `SPD*1.0*ACC:${iban}*AM:${Number(castka).toFixed(2)}*CC:CZK`;
      
      if (vs)  qrString += `*X-VS:${vs.substring(0, 10)}`;
      if (ss)  qrString += `*X-SS:${ss.substring(0, 10)}`;
      if (ks)  qrString += `*X-KS:${ks.substring(0, 4)}`;
      
      if (msg) {
          const cistaMsg = this.odstranDiakritiku(msg).substring(0, 140);
          qrString += `*MSG:${cistaMsg}`;
      }
      
      return qrString;
  }

  public prevedNaCesiIban(cisloUctu: string, kodBanky: string) {
      let ucetCisty = cisloUctu.trim().replace('-', '').padStart(10, '0');
      let bankaCista = kodBanky.trim().padStart(4, '0');
      
      const pismenaCZ = "123500";
      const overovaciRetezec = bankaCista + ucetCisty + pismenaCZ;
      
      let modulo = 0;
      for (let i = 0; i < overovaciRetezec.length; i++) {
          modulo = (modulo * 10 + parseInt(overovaciRetezec[i])) % 97;
      }
      
      const kontrolniCislice = String(98 - modulo).padStart(2, '0');
      return `CZ${kontrolniCislice}${bankaCista}000000${ucetCisty}`;
  }

  public odstranDiakritiku(text: string) {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

}
