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
import { TabsComponent } from '@Components/Tabs';
import { AddRewardModalComponent } from '../../students/detail/modals/add-reward-modal/add-reward-modal.component';
import { BehaviorSubject } from 'rxjs';


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
  imports: [CommonModule, IconsModule, RouterModule, FormsModule, TabsComponent],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent implements OnInit {
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  
  rewards: Reward[] = [];
  students: Student[] = [];
  loading = true;
  
  // Filter
  public rewardSelectedTab = new BehaviorSubject(0);
  public rewardOptions = [
    'all',
    'pending',
    'collected'
  ];

  
  ngOnInit() {
    this.loadRewards();
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
  
  get filteredRewards(): Reward[] {
    const tab = this.rewardSelectedTab.getValue();
    if (tab === 1) return this.rewards.filter(r => r.status === 'pending');
    if (tab === 2) return this.rewards.filter(r => r.status === 'collected');
    return this.rewards;
  }

  
  get pendingCount(): number {
    return this.rewards.filter(r => r.status === 'pending').length;
  }
  
  get totalPendingAmount(): number {
    return this.rewards
      .filter(r => r.status === 'pending' && r.amount)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }
  
  setFilter(index: number) {
    this.rewardSelectedTab.next(index);
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
    let type_id = 'other';
    if (['financial', 'certificate', 'prize'].includes(type)) {
      type_id = type;
    }
    return this.l.s(`rewards.type.${type_id}`);
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
}
