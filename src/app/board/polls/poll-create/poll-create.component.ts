import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService } from '../polls.service';
import { Router, RouterLink } from '@angular/router';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-poll-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './poll-create.component.html',
  styleUrl: './poll-create.component.css'
})
export class PollCreateComponent {
  public l = inject(Locale)
  private fb = inject(FormBuilder);
  private pollsService = inject(PollsService);
  private router = inject(Router);
  public dropdownManager = inject(DropdownManager)

  pollForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    type: ['test', Validators.required],
    active_from: [''],
    active_to: [''],
    time_limit: [null],
    questions: this.fb.array([])
  });

  get questions() {
    return this.pollForm.get('questions') as FormArray;
  }

  public questionTypes: string[] = ['text', 'uni', 'multi'];

  addQuestion() {
    const questionGroup = this.fb.group({
      title: ['', Validators.required],
      type: ['text', Validators.required],
      points: [0],
      options: this.fb.array([])
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(questionIndex: number) {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number) {
    const optionGroup = this.fb.group({
      label: ['', Validators.required],
      is_correct: [false]
    });
    this.getOptions(questionIndex).push(optionGroup);
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  submit() {
    if (this.pollForm.invalid) return;

    this.pollsService.createPoll(this.pollForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/tests']);
        }
      },
      error: (err) => console.error(err)
    });
  }
}
