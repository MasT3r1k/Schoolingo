import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll, Question } from '../polls.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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

  poll: Poll | null = null;
  questions: Question[] = [];
  voteForm: FormGroup = this.fb.group({
    answers: this.fb.array([])
  });
  loading = true;
  submitted = false;

  get answers() {
    return this.voteForm.get('answers') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPoll(Number(id));
    }
  }

  loadPoll(id: number) {
    this.loading = true;
    this.pollsService.getPoll(id).subscribe({
      next: (data) => {
        this.poll = data.poll;
        this.questions = data.questions;
        if (data.submission) {
            this.submitted = true;
            // Maybe show results or "Already submitted" message
        }
        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  initForm() {
    this.answers.clear();
    this.questions.forEach(q => {
      // For multiple choice, we might need FormArray of booleans or similar, 
      // but simplistic: optionIds array control
      let group;
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
    if (this.voteForm.invalid) return;
    if (!this.poll) return;

    this.pollsService.submitPoll(this.poll.id, this.voteForm.value.answers).subscribe({
      next: (res) => {
        if (res.success) {
           this.router.navigate(['/polls']);
           // Show success toast?
        }
      }
    });
  }
}
