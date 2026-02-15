import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';

interface TemplateSubject {
  subjectId: number;
  label: string;
  shortcut: string;
  isMain: number; // 0 or 1
  primaryHours: number[]; 
  // Frontend helper
  primaryHoursString: string;
  isMainBool: boolean;
}

@Component({
  selector: 'app-template-subject',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './template-subject.component.html',
  styleUrl: './template-subject.component.css'
})
export class TemplateSubjectComponent implements OnInit {
  private http = inject(HttpClient);
  
  subjects: TemplateSubject[] = [];
  loading = true;

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.loading = true;
    this.http.get<TemplateSubject[]>(Config.API_URL + '/v1/schedule/template_subjects', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.subjects = data.map(s => ({
            ...s,
            primaryHoursString: s.primaryHours ? s.primaryHours.join(',') : '',
            isMainBool: s.isMain === 1
          }));
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load template subjects', err);
          this.loading = false;
        }
      });
  }

  saveSubject(subject: TemplateSubject) {
    const payload = {
      isMain: subject.isMainBool,
      primaryHours: subject.primaryHoursString.split(',').map(h => parseInt(h.trim())).filter(h => !isNaN(h))
    };

    this.http.put(Config.API_URL + '/v1/schedule/template_subjects/' + subject.subjectId, payload, { withCredentials: true })
      .subscribe({
        next: () => {
          // Optional: show success toast
        },
        error: (err) => {
          console.error('Failed to save subject', err);
        }
      });
  }
}
