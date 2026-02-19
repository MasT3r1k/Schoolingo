import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService } from '../polls.service';
import { Authentication } from '@Schoolingo/authentication';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-poll-results',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './poll-results.component.html',
  styleUrl: './poll-results.component.css'
})
export class PollResultsComponent implements OnInit {
  private pollsService = inject(PollsService);
  private u = inject(Authentication);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  loading = true;
  pollId: number | null = null;
  
  // Data for teacher
  responses: any[] = [];
  questionStats: any = {};
  questionsCount = 0;
  
  // Data for student (or teacher viewing details)
  questions: any[] = [];
  
  // Grading view
  selectedSubmission: any = null;
  selectedAnswers: any[] = [];
  gradingForm: FormGroup = this.fb.group({});

  isTeacher = false;

  get averagePercentage(): number {
    const finished = this.responses.filter(r => r.status === 'Finished');
    if (finished.length === 0) return 0;
    const sum = finished.reduce((total, r) => total + (r.percentage || 0), 0);
    return Math.round(sum / finished.length);
  }

  get finishedCount(): number {
    return this.responses.filter(r => r.status === 'Finished').length;
  }

  ngOnInit() {
    this.isTeacher = this.u.getRole() == 'teacher' || this.u.getRole() == 'admin' || this.u.getUser().manager == -1;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pollId = Number(id);
      this.loadResults(Number(id));
    }
  }

  loadResults(id: number) {
    this.loading = true;
    this.pollsService.getResults(id).subscribe({
      next: (data) => {
        if (data.responses) {
            this.responses = data.responses;
            this.questionStats = data.questionStats;
            this.questionsCount = data.questionsCount;
        } else if (data.questions) {
            this.questions = data.questions;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewSubmission(studentId: number) {
    if (!this.pollId) return;
    this.loading = true;
    this.pollsService.getStudentSubmission(this.pollId, studentId).subscribe({
        next: (data) => {
            this.selectedSubmission = data.response;
            
            // Sort answers by selected_at to calculate time
            const sortedAnswers = [...data.answers].sort((a, b) => {
                const timeA = new Date(a.selected_at || 0).getTime();
                const timeB = new Date(b.selected_at || 0).getTime();
                return timeA - timeB;
            });

            const startTime = new Date(data.response.started_at).getTime();
            
            this.selectedAnswers = sortedAnswers.map((ans, index) => {
                const currentTime = new Date(ans.selected_at).getTime();
                let prevTime = startTime;
                if (index > 0) {
                    prevTime = new Date(sortedAnswers[index - 1].selected_at).getTime();
                }
                
                const diffMs = currentTime - prevTime;
                const minutes = Math.floor(diffMs / 60000);
                const seconds = Math.floor((diffMs % 60000) / 1000);
                
                return {
                    ...ans,
                    timeSpent: `${minutes}:${seconds.toString().padStart(2, '0')}`
                };
            });

            this.loading = false;
        }
    });
  }

  getDuration(start: string, end: string | null): string {
    if (!end) return '-';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMs = e - s;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  updateGrade(answerId: number, event: any) {
    const points = Number(event.target.value);
    if (!this.pollId || !this.selectedSubmission) return;
    
    // Optimistic update
    const ans = this.selectedAnswers.find(a => a.id === answerId);
    if(ans) ans.points_awarded = points;

    this.pollsService.gradeStudent(this.pollId, this.selectedSubmission.student_id, [{
        answerId,
        points
    }]).subscribe({
        next: (res: any) => {
            if (res.success) {
                this.selectedSubmission.total_score = res.totalScore;
                this.selectedSubmission.percentage = res.percentage;
            }
        }
    });
  }
}
