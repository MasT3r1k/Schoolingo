import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll } from './polls.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterModule],
  templateUrl: './polls.component.html',
  styleUrl: './polls.component.css'
})
export class PollsComponent implements OnInit {
  private pollsService = inject(PollsService);
  private router = inject(Router);

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
}
