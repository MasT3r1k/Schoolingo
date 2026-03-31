import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';

interface Student {
  person: number;
  name: string;
}

type reward_types = 'financial' | 'certificate' | 'prize' | 'other';

@Component({
  selector: 'add-reward-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './add-reward-modal.component.html',
  styleUrls: ['./add-reward-modal.component.css']
})
export class AddRewardModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

  public students: Student[] = [];
  public saving = false;
  public isStudentFixed = false;

  public newReward = {
    title: '',
    description: '',
    amount: null as number | null,
    type: 'financial' as reward_types,
    studentId: null as number | null
  };

  public rewardTypes: { id: reward_types; icon: string }[] = [
    { id: 'financial', icon: 'cash' },
    { id: 'certificate', icon: 'certificate' },
    { id: 'prize', icon: 'trophy' },
    { id: 'other', icon: 'gift' }
  ];

  ngOnInit() {
    // Pre-select student if provided via modal data
    const modalData = this.modalManager.getModalData('add_reward');
    if (modalData && modalData.studentId) {
      this.newReward.studentId = modalData.studentId;
      this.isStudentFixed = true;
    }
  }

  public getTypeLabel(type: string): string {
    const placeholder = 'rewards.type.' + type;
    const text = this.l.s('rewards.type.' + type);
    if (text == `[${placeholder}]`) {
      return this.l.s('rewards.type.other');
    }

    return text;
  }

  public selectedTypeIcon(): string | any {
    return this.rewardTypes.find(t => t.id === this.newReward.type)?.icon || 'gift';
  }

  submit() {
    if (!this.newReward.title || !this.newReward.studentId) {
      alert('Vyplňte prosím název odměny a vyberte studenta');
      return;
    }
    
    this.saving = true;
    
    this.http.post<{ reward_id: number; success: boolean }>(
      `${Config.API_URL}/v1/rewards`,
      {
        title: this.newReward.title,
        description: this.newReward.description,
        amount: this.newReward.amount,
        type: this.newReward.type,
        studentId: this.newReward.studentId
      },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.saving = false;
        const modalData = this.modalManager.getModalData('add_reward');
        if (modalData && modalData.callback) {
          modalData.callback();
        } else {
          window.location.reload();
        }
        this.close();
      },
      error: (err) => {
        console.error('Failed to create reward:', err);
        this.saving = false;
        alert('Nepodařilo se přidat odměnu');
      }
    });
  }

  close() {
    this.modalManager.closeModal('add_reward');
  }
}
