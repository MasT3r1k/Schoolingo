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
  selectedClasses: number[][] = [];

  assignForm: FormGroup = this.fb.group({
    active_from: ['', Validators.required],
    active_to: ['', Validators.required],
    time_limit: [null],
    allow_marking: [false],
    shuffle_questions: [false],
    shuffle_options: [false],
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
