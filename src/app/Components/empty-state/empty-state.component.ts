import { Component, inject, Input } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

interface ActionButton {
  type: 'primary' | 'secondary' | 'ghost';
  icon: string;
  label: string;
  action: Function;
}

@Component({
  selector: 'empty-state',
  imports: [IconsModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon: string = '';
  @Input() title_text: string = '';
  @Input() title_placeholders: Record<string, string> = {};
  @Input() description_text: string = '';
  @Input() description_placeholders: Record<string, string> = {};
  @Input() buttons: ActionButton[] = [];


  public l = inject(Locale)
}
