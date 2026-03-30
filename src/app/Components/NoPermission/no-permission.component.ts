import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'schoolingo-no-permission',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './no-permission.component.html',
  styleUrl: './no-permission.component.css'
})
export class NoPermissionComponent {
  public l = inject(Locale);
  
  @Input() title: string = 'error.no_permission_title';
  @Input() description: string = 'error.no_permission_desc';
  @Input() icon: string = 'lock';
  @Input() backButtonText: string = 'error.go_back';
  
  @Output() onBack = new EventEmitter<void>();

  goBack() {
    this.onBack.emit();
  }
}
