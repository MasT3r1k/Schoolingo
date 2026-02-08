import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll } from '../polls.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

interface ClassGroup {
  id: number;
  name: string;
  studentCount: number;
}

@Component({
  selector: 'app-poll-assign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './poll-assign.component.html',
  styleUrl: './poll-assign.component.css'
})
export class PollAssignComponent implements OnInit {
  public l = inject(Locale);
  private fb = inject(FormBuilder);
  private pollsService = inject(PollsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  poll: Poll | null = null;
  loading = true;
  classes: ClassGroup[] = [];
  selectedClasses: number[] = [];

  assignForm: FormGroup = this.fb.group({
    active_from: ['', Validators.required],
    active_to: ['', Validators.required],
    time_limit: [null],
    shuffle_questions: [false],
    shuffle_options: [false],
    show_results: [true],
    allow_review: [true]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPoll(Number(id));
      this.loadClasses();
    }
  }

  loadPoll(id: number) {
    this.loading = true;
    this.pollsService.getPoll(id).subscribe({
      next: (data) => {
        this.poll = data.poll;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadClasses() {
    this.http.get<{ classes: ClassGroup[] }>(
      `${Config.API_URL}/v1/classes`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.classes = data.classes || [];
      },
      error: (err) => console.error(err)
    });
  }

  toggleClass(classId: number) {
    const index = this.selectedClasses.indexOf(classId);
    if (index > -1) {
      this.selectedClasses.splice(index, 1);
    } else {
      this.selectedClasses.push(classId);
    }
  }

  isClassSelected(classId: number): boolean {
    return this.selectedClasses.includes(classId);
  }

  selectAllClasses() {
    if (this.selectedClasses.length === this.classes.length) {
      this.selectedClasses = [];
    } else {
      this.selectedClasses = this.classes.map(c => c.id);
    }
  }

  getTotalStudents(): number {
    return this.classes
      .filter(c => this.selectedClasses.includes(c.id))
      .reduce((sum, c) => sum + c.studentCount, 0);
  }

  submit() {
    if (this.assignForm.invalid || this.selectedClasses.length === 0) return;
    if (!this.poll) return;

    const payload = {
      ...this.assignForm.value,
      classIds: this.selectedClasses
    };

    this.http.post(
      `${Config.API_URL}/v1/polls/${this.poll.id}/assign`,
      payload,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.router.navigate(['/tests']);
      },
      error: (err) => console.error(err)
    });
  }
}
