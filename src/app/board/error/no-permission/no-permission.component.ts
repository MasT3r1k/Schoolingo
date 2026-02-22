import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-no-permission',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterModule],
  templateUrl: './no-permission.component.html',
  styleUrls: ['./no-permission.component.css']
})
export class NoPermissionComponent {
  public l = inject(Locale);
}
