import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { RouterModule } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';

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
}

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterModule],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent implements OnInit {
  private auth = inject(Authentication);
  
  rewards: Reward[] = [];
  loading = true;
  isTeacher = false;
  
  // Filter
  filterStatus: 'all' | 'pending' | 'collected' = 'all';
  
  ngOnInit() {
    this.isTeacher = this.auth.getRole() === 'teacher' || this.auth.getRole() === 'admin' || this.auth.getUser()?.manager !== -1;
    this.loadRewards();
  }
  
  loadRewards() {
    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.rewards = [
        {
          id: 1,
          title: 'Odměna za účast v soutěži',
          description: 'Finanční odměna za 2. místo v krajském kole programovací soutěže.',
          amount: 1500,
          type: 'financial',
          status: 'pending',
          createdAt: new Date(),
          studentName: 'Jan Novák',
          studentId: 1
        },
        {
          id: 2,
          title: 'Diplom - Olympiáda v matematice',
          description: 'Diplom za účast v okresním kole matematické olympiády.',
          type: 'certificate',
          status: 'pending',
          createdAt: new Date('2024-12-01'),
          studentName: 'Marie Dvořáková',
          studentId: 2
        },
        {
          id: 3,
          title: 'Stipendium za prospěch',
          description: 'Pololetní stipendium za vynikající studijní výsledky.',
          amount: 3000,
          type: 'financial',
          status: 'collected',
          createdAt: new Date('2024-11-15'),
          collectedAt: new Date('2024-11-20'),
          studentName: 'Petr Horák',
          studentId: 3
        }
      ];
      this.loading = false;
    }, 500);
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
      case 'financial': return 'Finanční odměna';
      case 'certificate': return 'Diplom / Certifikát';
      case 'prize': return 'Věcná cena';
      default: return 'Ostatní';
    }
  }
  
  markAsCollected(reward: Reward) {
    // TODO: API call
    reward.status = 'collected';
    reward.collectedAt = new Date();
  }
  
  openAddReward() {
    // TODO: Open modal for adding reward
    console.log('Add reward clicked');
  }
}
