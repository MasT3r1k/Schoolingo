import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll } from '../polls.service';
import { Authentication } from '@Schoolingo/authentication';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-poll-shares',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterLink],
  templateUrl: './poll-shares.component.html',
  styleUrl: './poll-shares.component.css'
})
export class PollSharesComponent implements OnInit {
  private pollsService = inject(PollsService);
  private u = inject(Authentication);
  private route = inject(ActivatedRoute);

  loading = true;
  pollId: number | null = null;
  poll: Poll | null = null;
  shares: any[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pollId = Number(id);
      this.loadData(Number(id));
    }
  }

  loadData(id: number) {
    this.loading = true;
    
    // Load poll info
    this.pollsService.getPoll(id).subscribe({
      next: (data) => {
        this.poll = data.poll;
      }
    });

    // Load shares
    this.pollsService.getShares(id).subscribe({
      next: (data) => {
        this.shares = data.shares;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  removeShare(shareId: number) {
    if (!this.pollId) return;
    
    if (confirm('Opravdu chcete odebrat sdílení tomuto učiteli?')) {
      this.pollsService.removeShare(this.pollId, shareId).subscribe({
        next: (res) => {
          if (res.success) {
            this.shares = this.shares.filter(s => s.id !== shareId);
          }
        }
      });
    }
  }
}
