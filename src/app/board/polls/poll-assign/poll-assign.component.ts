import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PollsService, Poll } from '../polls.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";

interface ClassGroup {
  groupId: number;
  subjectId: number;
  subject: string;
  shortSubject: string;
  className: string;
  studentCount: number;
}

interface PollOption {
  icon: string,
  title: string,
  description: string,
  formName: string,
  require?: string[]
}

@Component({
  selector: 'app-poll-assign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, RouterLink, StatCardComponent],
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
  selectedClasses: number[][] = [];

  assignForm: FormGroup = this.fb.group({
    active_from: [new Date().toISOString().slice(0, 16), Validators.required],
    active_to: [''], // Optional
    time_limit: [null],
    allow_marking: [false],
    shuffle_questions: [true],
    shuffle_options: [true],
    show_results: [true],
    allow_review: [true]
  });

  public poll_options: PollOption[] = [
    {
      icon: "arrows-shuffle",
      title: "Zamíchat otázky",
      description: "Každý student uvidí otázky v jiném pořadí",
      formName: "shuffle_questions"
    },
    {
      icon: "arrows-shuffle",
      title: "Zamíchat možnosti",
      description: "Možnosti u každé otázky budou v náhodném pořadí",
      formName: "shuffle_options"
    },
    {
      icon: "eye",
      title: "Povolit náhled odpovědí",
      description: "Studenti si budou moci prohlédnout své odpovědi po odevzdání",
      formName: "allow_review"
    },
    {
      icon: "chart-bar",
      title: "Zobrazit výsledky",
      description: "Studenti uvidí své výsledky po odevzdání",
      formName: "show_results",
      require: ["allow_review"]
    }
  ];

  public checkIfEnabled(option: PollOption): boolean {
    return (option.require && this.assignForm.get(option.require[0])?.value || !option.require) ? true : false;
  }

  public toggleValue(option: PollOption): void {
    if (!this.checkIfEnabled(option)) {
      return;
    }

    const input = this.assignForm.get(option.formName);
    input?.setValue(!input.value);
  }

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
    this.http.get<{ groups: ClassGroup[] }>(
      `${Config.API_URL}/v1/marks/teacher/list`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.classes = data.groups || [];
      },
      error: (err) => console.error(err)
    });
  }

  toggleClass(classId: number, subjectId: number) {
    const index = this.selectedClasses.findIndex((cl) => cl[0] == classId && cl[1] == subjectId);
    if (index > -1) {
      this.selectedClasses.splice(index, 1);
    } else {
      this.selectedClasses.push([classId, subjectId]);
    }
  }

  isClassSelected(classId: number, subjectId: number): boolean {
    return this.selectedClasses.findIndex((cl) => cl[0] == classId && cl[1] == subjectId) !== -1;
  }

  selectAllClasses() {
    if (this.selectedClasses.length === this.classes.length) {
      this.selectedClasses = [];
    } else {
      this.selectedClasses = this.classes.map(c => [c.groupId, c.subjectId]);
    }
  }

  getTotalStudents(): number {
    return this.classes
      .filter(c => this.isClassSelected(c.groupId, c.subjectId))
      .reduce((sum, c) => sum + c.studentCount, 0);
  }

  submit() {
    console.log('Submit clicked');
    console.log('Form status:', this.assignForm.status);
    console.log('Selected classes:', this.selectedClasses.length);
    
    if (this.assignForm.invalid) {
         console.error('Form is invalid', this.assignForm.errors);
         // Log individual control errors
         Object.keys(this.assignForm.controls).forEach(key => {
            const errors = this.assignForm.get(key)?.errors;
            if (errors) {
                console.error(`Control ${key} errors:`, errors);
            }
         });
         return;
    }
    
    if (this.selectedClasses.length === 0) {
        console.error('No classes selected');
        return;
    }
    
    if (!this.poll) {
        console.error('Poll not loaded');
        return;
    }

    const payload = {
      pollId: this.poll.id,
      targets: this.selectedClasses.map(c => ({ groupId: c[0], subjectId: c[1] })),
      settings: {
        start: this.assignForm.get('active_from')?.value,
        end: this.assignForm.get('active_to')?.value,
        timeLimit: this.assignForm.get('time_limit')?.value || 0,
        shuffleQuestions: this.assignForm.get('shuffle_questions')?.value,
        shuffleOptions: this.assignForm.get('shuffle_options')?.value,
        showResults: this.assignForm.get('show_results')?.value,
        allowReview: this.assignForm.get('allow_review')?.value,
        gradeColumn: null // TODO: Implement grading
      }
    };

    this.http.post(
      `${Config.API_URL}/v1/polls/assign`,
      payload,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.router.navigate(['/board/polls']); // Redirect to list
      },
      error: (err) => console.error(err)
    });
  }
}
