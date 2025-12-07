import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService } from '../polls.service';
import { Authentication } from '@Schoolingo/authentication';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-poll-results',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
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
  
  // Data for student (or teacher viewing details)
  questions: any[] = [];
  
  // Grading view
  selectedSubmission: any = null;
  selectedAnswers: any[] = [];
  gradingForm: FormGroup = this.fb.group({});

  isTeacher = false;

  get averagePercentage(): number {
    if (this.responses.length === 0) return 0;
    const sum = this.responses.reduce((total, r) => total + (r.percentage || 0), 0);
    return Math.round(sum / this.responses.length);
  }

  ngOnInit() {
    this.isTeacher = this.u.getRole() == 'teacher' || this.u.getRole() == 'admin' || this.u.getUser().manager != -1;

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
            this.selectedAnswers = data.answers;
            this.loading = false;
        }
    });
  }

  updateGrade(answerId: number, event: any) {
    const points = Number(event.target.value);
    // Simple immediate update or collect updates? 
    // Requirement "možnost upravovat výsledek každého studenta"
    if (!this.pollId || !this.selectedSubmission) return;
    
    // Optimistic update
    const ans = this.selectedAnswers.find(a => a.id === answerId);
    if(ans) ans.points_awarded = points;

    this.pollsService.gradeStudent(this.pollId, this.selectedSubmission.student_id, [{
        answerId,
        points
    }]).subscribe({
        next: (res) => {
            if (res.success) {
                this.selectedSubmission.total_score = res.totalScore;
                this.selectedSubmission.percentage = res.percentage;
            }
        }
    });
  }
}
