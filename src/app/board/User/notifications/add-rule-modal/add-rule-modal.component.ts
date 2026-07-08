import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  standalone: true,
  selector: 'app-add-rule-modal',
  imports: [CommonModule, IconsModule],
  templateUrl: './add-rule-modal.component.html',
  styleUrl: './add-rule-modal.component.css'
})
export class AddRuleModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('add-adv-rule');
  }

  addRule(typeId: string): void {
    if (this.data?.hasRuleOfType && this.data.hasRuleOfType(typeId)) return;
    
    if (this.data && this.data.onAdd) {
      this.data.onAdd(typeId);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.modalManager.closeModal('add-adv-rule');
  }
}
