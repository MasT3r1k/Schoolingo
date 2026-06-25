import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-canteen-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  title = 'Nastavení modulu Jídelna';
  subtitle = 'Konfigurace objednávek a propojení s platebním modulem.';

  save() {
    alert('Nastavení bylo uloženo.');
  }
}
