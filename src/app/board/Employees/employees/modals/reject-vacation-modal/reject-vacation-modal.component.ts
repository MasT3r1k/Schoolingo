import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-reject-vacation-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './reject-vacation-modal.component.html',
  styleUrls: ['./reject-vacation-modal.component.css']
})
export class RejectVacationModalComponent {
  public l = inject(Locale);
  public modalManager = inject(ModalManager);
  
  public reason = '';
  public loading = false;

  public confirm() {
    const data = this.modalManager.getModalData('reject_vacation');
    if (data && data.onConfirm) {
      this.loading = true;
      data.onConfirm(this.reason);
      // The parent component will handle closing the modal if they want, 
      // or we can close it here if we assume it's successful.
      // Usually, the callback is async or handles the API call.
      // Looking at EmployeesComponent, it does the API call in onConfirm.
      this.close();
    }
  }

  public close() {
    this.modalManager.closeModal('reject_vacation');
  }
}
