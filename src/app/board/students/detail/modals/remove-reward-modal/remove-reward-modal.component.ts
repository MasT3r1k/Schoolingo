import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-remove-reward-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './remove-reward-modal.component.html'
})
export class RemoveRewardModalComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('remove_reward');
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove_reward');
  }

  public confirm(): void {
    if (this.data && this.data.callback) {
      this.data.callback();
    }
    this.closeModal();
  }
}
