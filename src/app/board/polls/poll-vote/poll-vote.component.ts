import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll, Question } from '../polls.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-poll-vote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './poll-vote.component.html',
  styleUrl: './poll-vote.component.css'
})
export class PollVoteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pollsService = inject(PollsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  pollId: number | null = null;
  poll: Poll | null = null;
  questions: Question[] = [];
  voteForm: FormGroup = this.fb.group({
    answers: this.fb.array([])
  });
  loading = true;
  submitted = false;
  started = false;
  completed = false;
  error: string | null = null;

  get answers() {
    return this.voteForm.get('answers') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pollId = Number(id);
      this.loadPoll(this.pollId);
    }
  }

  retryLoad() {
    if (this.pollId) {
      this.loadPoll(this.pollId);
    }
  }

  loadPoll(id: number) {
    this.loading = true;
    this.pollsService.getPoll(id).subscribe({
      next: (data) => {
        this.poll = data.poll;
        this.questions = data.questions;

        const assignment = data.assignment;
        if (assignment && this.poll && assignment.time_limit !== undefined && assignment.time_limit !== null) {
             this.poll.time_limit = assignment.time_limit;
        }

        if (data.submission) {
             this.started = true;
             if (data.submission.submitted_at) {
                 this.submitted = true;
                 this.completed = true;
                 this.submissionScore = data.submission.total_score;
                 this.maxScore = data.submission.total_max_score;
             }
        } else {
             this.started = false;
        }


        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading poll:', err);
        this.error = 'Nepodařilo se načíst test. Zkuste to prosím později.';
        this.loading = false;
      }
    });
  }



  initForm() {
    this.answers.clear();
    this.questions.forEach(q => {
      // For multiple choice, we might need FormArray of booleans or similar, 
      // but simplistic: optionIds array control
      let group: FormGroup;
      if (q.type === 'multiple') {
         // simplified: use a custom control or array of checkboxes manully mapped
         // We will map it manually in HTML to set value in a FormControl holding array of IDs
         group = this.fb.group({
            questionId: [q.id],
            optionIds: [[]] // Array of numbers
         });
      } else if (q.type === 'single') {
          group = this.fb.group({
            questionId: [q.id],
            optionId: [null, Validators.required]
          });
      } else {
          group = this.fb.group({
            questionId: [q.id],
            answerText: ['', Validators.required]
          });
      }
      this.answers.push(group);
      
      // Listen for changes
      group.valueChanges.pipe(debounceTime(400)).subscribe((val: any) => {
          if (this.started && !this.completed) {
              this.pollsService.sendAnswer(this.poll!.id, val).subscribe();
          }
      });
    });
  }

  startTest() {
      if (!this.poll) return;
      this.loading = true;
      this.error = null;
      this.pollsService.startPoll(this.poll.id).subscribe({
          next: (res) => {
              if (res.success) {
                  this.loadPoll(this.poll!.id);
              } else {
                  this.error = 'Nepodařilo se spustit test.';
                  this.loading = false;
              }
          },
          error: (err) => {
              console.error('Error starting poll:', err);
              this.error = 'Došlo k chybě při spouštění testu.';
              this.loading = false;
          }
      });
  }

  onCheckboxChange(questionIndex: number, optionId: number, event: any) {
    const group = this.answers.at(questionIndex);
    const current = group.get('optionIds')?.value as number[];
    if (event.target.checked) {
        group.patchValue({ optionIds: [...current, optionId] });
    } else {
        group.patchValue({ optionIds: current.filter(x => x !== optionId) });
    }
  }

  submit() {
    if (this.voteForm.invalid) {
         console.warn('Cannot submit, form is invalid:', this.voteForm.errors);
         this.answers.controls.forEach((c, i) => {
             if (c.invalid) {
                 console.warn(`Question ${i} invalid:`, c.errors);
             }
         });
         return;
    }
    if (!this.poll) return;

    console.log('Submitting poll answers:', this.voteForm.value.answers);
    this.loading = true;
    this.pollsService.submitPoll(this.poll.id, this.voteForm.value.answers).subscribe({
      next: (res) => {
        if (res.success) {
           this.submitted = true;
           this.completed = true;
           this.submissionScore = res.score;
           this.maxScore = res.max;
           this.loading = false;
        } else {
           console.error('Submit failed', res);
           this.loading = false;
        }
      },
      error: (err) => {
          console.error('Error submitting poll:', err);
          this.loading = false;
      }
    });
  }

  // Helper methods
  submissionScore: number | null = null;
  maxScore: number | null = null;
  timeRemaining: number | null = null;

  getTotalPoints(): number {
    return this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }

  getAnsweredCount(): number {
    return this.answers.controls.filter((ctrl, i) => this.isAnswered(i)).length;
  }

  isAnswered(index: number): boolean {
    const answer = this.answers.at(index);
    const question = this.questions[index];
    if (!question) return false;

    if (question.type === 'text') {
      return !!answer.get('answerText')?.value?.trim();
    } else if (question.type === 'single') {
      return answer.get('optionId')?.value !== null;
    } else if (question.type === 'multiple') {
      const optionIds = answer.get('optionIds')?.value as number[];
      return optionIds && optionIds.length > 0;
    }
    return false;
  }

  isOptionSelected(questionIndex: number, optionId: number): boolean {
    const group = this.answers.at(questionIndex);
    const optionIds = group.get('optionIds')?.value as number[];
    return optionIds && optionIds.includes(optionId);
  }
}
