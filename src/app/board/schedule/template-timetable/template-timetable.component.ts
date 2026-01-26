import { Component, HostListener, inject } from '@angular/core';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  imports: [IconsModule],
  templateUrl: './template-timetable.component.html',
  styleUrl: './template-timetable.component.css'
})
export class TemplateTimetableComponent {
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public is_dragging = false;

  public selected_type: 'empty' | 'disabled' | 'maybe' | 'lunch' | 'continuous' = 'empty';

  public selected_scope = '';
  public scopes: any[] = [];

  public schema: string[][] = [
    ['disabled', 'continuous', 'continuous', 'continuous', 'continuous', 'lunch', 'disabled', 'disabled', 'disabled', 'disabled'],
    ['disabled', 'continuous', 'continuous', 'continuous', 'continuous', 'lunch', 'disabled', 'disabled', 'disabled', 'disabled'],
    ['disabled', 'continuous', 'continuous', 'continuous', 'continuous', 'lunch', 'disabled', 'disabled', 'disabled', 'disabled'],
    ['disabled', 'continuous', 'continuous', 'continuous', 'continuous', 'lunch', 'disabled', 'disabled', 'disabled', 'disabled'],
    ['disabled', 'continuous', 'continuous', 'continuous', 'continuous', 'lunch', 'disabled', 'disabled', 'disabled', 'disabled']
  ]

  public updateCell(x: number, y: number, type: string): void {
    if (!this.is_dragging) return;
    this.schema[x][y] = type;
  }
  
  @HostListener('window:mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.is_dragging = true;
      console.log('LMB down');
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.is_dragging = false;
  }
}
