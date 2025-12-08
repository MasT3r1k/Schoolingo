import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { RouterModule } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { FormsModule } from '@angular/forms';

interface Reward {
  id: number;
  title: string;
  description: string;
  amount?: number;
  type: 'financial' | 'certificate' | 'prize' | 'other';
  status: 'pending' | 'collected';
  createdAt: Date;
  collectedAt?: Date;
  studentName?: string;
  studentId?: number;
  createdByName?: string;
}

interface Student {
  person: number;
  name: string;
}

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterModule, FormsModule],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent implements OnInit {
  private auth = inject(Authentication);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  
  rewards: Reward[] = [];
  students: Student[] = [];
  loading = true;
  isTeacher = false;
  
  // Filter
  filterStatus: 'all' | 'pending' | 'collected' = 'all';
  
  // Add reward form
  showAddForm = false;
  newReward = {
    title: '',
    description: '',
    amount: null as number | null,
    type: 'other' as 'financial' | 'certificate' | 'prize' | 'other',
    studentId: null as number | null
  };
  saving = false;
  
  ngOnInit() {
    this.isTeacher = this.auth.getRole() === 'teacher' || this.auth.getRole() === 'admin' || this.auth.getUser()?.manager !== -1;
    this.loadRewards();
    
    if (this.isTeacher) {
      this.loadStudents();
    }
  }
  
  loadRewards() {
    this.loading = true;
    
    this.http.get<{ rewards: any[] }>(
      `${Config.API_URL}/v1/rewards`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.rewards = response.rewards.map(r => ({
          ...r,
          createdAt: new Date(r.createdAt),
          collectedAt: r.collectedAt ? new Date(r.collectedAt) : undefined
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load rewards:', err);
        this.loading = false;
      }
    });
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
        console.error('Failed to load students:', err);
      }
    });
  }
  
  get filteredRewards(): Reward[] {
    if (this.filterStatus === 'all') return this.rewards;
    return this.rewards.filter(r => r.status === this.filterStatus);
  }
  
  get pendingCount(): number {
    return this.rewards.filter(r => r.status === 'pending').length;
  }
  
  get totalPendingAmount(): number {
    return this.rewards
      .filter(r => r.status === 'pending' && r.amount)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }
  
  setFilter(status: 'all' | 'pending' | 'collected') {
    this.filterStatus = status;
  }
  
  getTypeIcon(type: string): string {
    switch (type) {
      case 'financial': return 'cash';
      case 'certificate': return 'certificate';
      case 'prize': return 'trophy';
      default: return 'gift';
    }
  }
  
  getTypeLabel(type: string): string {
    switch (type) {
      case 'financial': return this.l.s('rewards.type.financial');
      case 'certificate': return this.l.s('rewards.type.certificate');
      case 'prize': return this.l.s('rewards.type.prize');
      default: return this.l.s('rewards.type.other');
    }
  }
  
  markAsCollected(reward: Reward) {
    this.http.put(
      `${Config.API_URL}/v1/rewards/${reward.id}`,
      { status: 'collected' },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        reward.status = 'collected';
        reward.collectedAt = new Date();
      },
      error: (err) => {
        console.error('Failed to update reward:', err);
      }
    });
  }
  
  openAddReward() {
    this.showAddForm = true;
    this.resetForm();
  }
  
  closeAddForm() {
    this.showAddForm = false;
    this.resetForm();
  }
  
  resetForm() {
    this.newReward = {
      title: '',
      description: '',
      amount: null,
      type: 'other',
      studentId: null
    };
  }
  
  saveReward() {
    if (!this.newReward.title || !this.newReward.studentId) {
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
        this.showAddForm = false;
        this.loadRewards(); // Reload to get full data
      },
      error: (err) => {
        console.error('Failed to create reward:', err);
        this.saving = false;
      }
    });
  }
  
  deleteReward(reward: Reward) {
    if (!confirm(this.l.s('rewards.confirm_delete'))) {
      return;
    }
    
    this.http.delete(
      `${Config.API_URL}/v1/rewards/${reward.id}`,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.rewards = this.rewards.filter(r => r.id !== reward.id);
      },
      error: (err) => {
        console.error('Failed to delete reward:', err);
      }
    });
  }
}
