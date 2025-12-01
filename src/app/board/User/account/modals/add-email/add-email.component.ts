import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-email.component.html',
  styleUrl: './add-email.component.css'
})
export class AddEmailComponent {
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  public showSelect: null | 'type' = null;
  public email_types = ['personal', 'school', 'work', 'other'];
  public email_selected = 0;

  public email = '@';

  public saveEmail(): void {
    if (this.email == '') {
      return;
    }
  }
}
