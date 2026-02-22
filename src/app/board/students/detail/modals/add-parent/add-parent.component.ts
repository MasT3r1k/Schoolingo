import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  imports: [IconsModule],
  templateUrl: './add-parent.component.html',
  styleUrl: './add-parent.component.css'
})
export class AddParentComponent {
  private modalManager = inject(ModalManager);
  public closeModal(): void {
    this.modalManager.closeModal('add_parent')
  }
}
