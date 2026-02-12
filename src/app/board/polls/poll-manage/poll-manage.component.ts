import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll } from '../polls.service';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  selector: 'app-poll-manage',
  imports: [CommonModule, IconsModule, FormsModule, RouterLink],
  templateUrl: './poll-manage.component.html',
  styleUrl: './poll-manage.component.css'
})
export class PollManageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollsService = inject(PollsService);
  private http = inject(HttpClient);
  public dropdownManager = inject(DropdownManager);

  pollId: number = 0;
  poll: Poll | null = null;
  loading = true;
  resultsSummary: any = { count: 0, average: 0 };

  // Share Modal
  showShareModal = false;
  teachers: any[] = [];
  shareSearchQuery = '';
  filteredTeachers: any[] = [];
  selectedTeacherId: number | null = null;
  isSharing = false;

  get isActive(): boolean {
    if (!this.poll?.active_from) return false;
    const now = new Date();
    const from = new Date(this.poll.active_from);
    const to = this.poll.active_to ? new Date(this.poll.active_to) : null;
    return now >= from && (!to || now <= to);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pollId = +params['id'];
        this.loadPoll();
        this.loadResultsSummary();
        this.loadTeachers();
      }
    });
  }

  loadPoll() {
    this.pollsService.getPoll(this.pollId).subscribe({
      next: (res: any) => {
        this.poll = res.poll;
        if (Array.isArray(res.questions)) {
            this.poll!.questionCount = res.questions.length;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Optionally redirect or show error
      }
    });
  }

  loadResultsSummary() {
    this.pollsService.getResults(this.pollId).subscribe({
      next: (res: any) => {
        const responses = res.responses || [];
        const total = responses.length;
        const avg = total > 0 
          ? responses.reduce((acc: number, r: any) => acc + r.percentage, 0) / total 
          : 0;
        this.resultsSummary = {
          count: total,
          average: Math.round(avg)
        };
      },
      error: () => {
        this.resultsSummary = { count: 0, average: 0 };
      }
    });
  }

  loadTeachers() {
    this.http.get<{ data: any[] }>(`${Config.API_URL}/v1/employees`, { 
        withCredentials: true,
        params: { role: 'teacher', status: 'active', limit: 100 } 
    }).subscribe({
        next: (res) => {
            this.teachers = res.data;
            this.filteredTeachers = res.data;
        }
    });
  }

  filterTeachers() {
    if (!this.shareSearchQuery) {
        this.filteredTeachers = this.teachers;
        return;
    }
    const q = this.shareSearchQuery.toLowerCase();
    this.filteredTeachers = this.teachers.filter(t => 
        (t.firstName + ' ' + t.lastName).toLowerCase().includes(q)
    );
  }

  selectTeacher(id: number) {
    this.selectedTeacherId = (this.selectedTeacherId === id) ? null : id;
  }

  openShareModal() {
    this.showShareModal = true;
    this.selectedTeacherId = null;
    this.shareSearchQuery = '';
    this.filteredTeachers = this.teachers;
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  submitShare() {
    if (!this.selectedTeacherId) return;
    this.isSharing = true;
    this.pollsService.sharePoll(this.pollId, this.selectedTeacherId).subscribe({
        next: () => {
            this.isSharing = false;
            this.showShareModal = false;
            alert('Test úspěšně sdílen.'); // Simple alert for now
        },
        error: (err) => {
             this.isSharing = false;
             console.error(err);
             alert('Chyba při sdílení testu.');
        }
    });
  }
}
