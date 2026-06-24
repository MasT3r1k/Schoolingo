import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll } from './polls.service';
import { Router, RouterModule } from '@angular/router';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterModule, StatCardComponent],
  templateUrl: './polls.component.html',
  styleUrl: './polls.component.css'
})
export class PollsComponent implements OnInit {
  public l = inject(Locale);
  private pollsService = inject(PollsService);
  private router = inject(Router);
  public perms = inject(Permission);

  public tests: Poll[] = [];
  public canCreate = false;
  public loading = true;

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests() {
    this.loading = true;
    this.pollsService.getPolls().subscribe({
      next: (data) => {
        // Filter only tests
        this.tests = data.polls.filter(p => p.type === 'test');
        this.canCreate = data.canCreate;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load polls', err);
        this.loading = false;
      }
    });
  }

  getCompletedCount(): number {
    return this.tests.filter(t => t.submitted_at).length;
  }

  getPendingCount(): number {
    return this.tests.filter(t => !t.submitted_at).length;
  }

  isUrgent(test: Poll): boolean {
    if (!test.active_to || test.submitted_at) return false;
    const deadline = new Date(test.active_to);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 24;
  }
}
