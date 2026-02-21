import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll, Question, Option } from '../polls.service';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-poll-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, RouterLink],
  templateUrl: './poll-edit.component.html',
  styleUrl: './poll-edit.component.css'
})
export class PollEditComponent implements OnInit {
  public l = inject(Locale);
  private fb = inject(FormBuilder);
  private pollsService = inject(PollsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public dropdownManager = inject(DropdownManager);

  pollId: number = 0;
  poll: Poll | null = null;
  loading = true;
  saving = false;
  saveError = '';
  saveSuccess = false;

  pollForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    test_type: ['all', Validators.required],
    require_type: ['points', Validators.required],
    time_limit: [null],
    questions: this.fb.array([])
  });

  get questions() {
    return this.pollForm.get('questions') as FormArray;
  }

  public testTypes: string[] = ['all', 'random'];
  public requireTypes: string[] = ['points', 'questions'];
  public questionTypes: string[] = ['text', 'uni', 'multi'];

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pollId = +params['id'];
        this.loadPoll();
      }
    });
  }

  loadPoll() {
    this.loading = true;
    this.pollsService.getPoll(this.pollId).subscribe({
      next: (res: any) => {
        this.poll = res.poll;
        this.populateForm(res.poll, res.questions || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  populateForm(poll: Poll, questions: Question[]) {
    // Patch basic poll details
    this.pollForm.patchValue({
      title: poll.title,
      description: poll.description,
      time_limit: poll.time_limit,
    });

    // Rebuild questions FormArray
    const questionsArray = this.pollForm.get('questions') as FormArray;
    questionsArray.clear();

    questions.forEach((q: Question) => {
      const optionsArray = this.fb.array(
        (q.options || []).map((opt: Option) => this.fb.group({
          id: [opt.id],
          label: [opt.label, Validators.required],
          is_correct: [opt.is_correct ?? false]
        }))
      );

      const questionGroup = this.fb.group({
        id: [q.id],
        title: [q.title, Validators.required],
        type: [q.type, Validators.required],
        points: [q.points ?? 0],
        options: optionsArray
      });

      questionsArray.push(questionGroup);
    });
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      id: [null],
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

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number) {
    const optionGroup = this.fb.group({
      id: [null],
      label: ['', Validators.required],
      is_correct: [false]
    });
    this.getOptions(questionIndex).push(optionGroup);
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  moveQuestionUp(index: number) {
    if (index === 0) return;
    const ctrl = this.questions.at(index);
    this.questions.removeAt(index);
    this.questions.insert(index - 1, ctrl);
  }

  moveQuestionDown(index: number) {
    if (index >= this.questions.length - 1) return;
    const ctrl = this.questions.at(index);
    this.questions.removeAt(index);
    this.questions.insert(index + 1, ctrl);
  }

  getTotalPoints(): number {
    return this.questions.controls.reduce((sum, q) => sum + (q.get('points')?.value || 0), 0);
  }

  submit() {
    if (this.pollForm.invalid) return;
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = false;

    this.pollsService.updatePoll(this.pollId, this.pollForm.value).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.saveSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/tests', this.pollId, 'manage']);
          }, 1200);
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Chyba při ukládání testu.';
      }
    });
  }
}
