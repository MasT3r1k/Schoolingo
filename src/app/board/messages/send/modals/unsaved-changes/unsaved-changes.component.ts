import { Component, inject } from '@angular/core';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-unsaved-changes',
  imports: [IconsModule],
  templateUrl: './unsaved-changes.component.html',
  styleUrl: './unsaved-changes.component.css'
})
export class UnsavedChangesComponent {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);

  public saveConcept(): void {
    const data = this.modalManager.getModalData('unsaved_changes');
    if (data && data.saveConcept) {
      data.saveConcept();
    }
  }

  public confirmLeave(): void {
    const data = this.modalManager.getModalData('unsaved_changes');
    if (data && data.onConfirm) {
      data.onConfirm();
    }
  }

  public cancelLeave(): void {
    const data = this.modalManager.getModalData('unsaved_changes');
    if (data && data.onCancel) {
      data.onCancel();
    }
  }
}
