import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'add-employee-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './vacation-request-modal.component.html',
  styleUrls: ['./vacation-request-modal.component.css']
})
export class VacationRequestModalComponent {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public types = ['vacation', 'sick_leave', 'personal_leave', 'unpaid_leave', 'study_leave'];
  public selected_type = 'vacation';

  close() {
    this.modalManager.closeModal('request_vacation');
  }
}
