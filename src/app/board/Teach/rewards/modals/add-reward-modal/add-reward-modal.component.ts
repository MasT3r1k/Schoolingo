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

  public newReward = {
    title: '',
    description: '',
    amount: null as number | null,
    type: 'other' as 'financial' | 'certificate' | 'prize' | 'other',
    studentId: null as number | null
  };

  public rewardTypes: { id: 'financial' | 'certificate' | 'prize' | 'other'; name: string; icon: string }[] = [
    { id: 'financial', name: 'Finanční', icon: 'cash' },
    { id: 'certificate', name: 'Certifikát/Diplom', icon: 'certificate' },
    { id: 'prize', name: 'Věcná cena', icon: 'trophy' },
    { id: 'other', name: 'Jiné', icon: 'gift' }
  ];

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.http.get<{ students: any[] }>(
      `${Config.API_URL}/v1/students`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.students = response.students.map(s => ({
          person: s.person,
          name: `${s.lastname} ${s.firstname}`
        }));
      },
      error: (err) => {
        console.error('Failed to load students in modal:', err);
      }
    });
  }

  public selectedStudentName(): string {
    if (!this.newReward.studentId) return 'Vyberte studenta';
    return this.students.find(s => s.person === this.newReward.studentId)?.name || 'Vyberte studenta';
  }

  public selectedTypeName(): string {
    return this.rewardTypes.find(t => t.id === this.newReward.type)?.name || 'Jiné';
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
        this.close();
        window.location.reload();
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
