import { NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'stat-card',
  imports: [IconsModule, NgClass],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  public l = inject(Locale);

  @Input() type: 'primary' | 'success' | 'info' | 'danger' | 'warning' = 'primary';
  @Input() icon = '';
  @Input() label = '';
  @Input() value: string | number | null | undefined = '';
  @Input() sub = '';
  @Input() sub_type: 'primary' | 'success' | 'info' | 'danger' | 'warning' | undefined = undefined;
}
