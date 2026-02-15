import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';
import { Locale } from '@Schoolingo/locale';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-online',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public auth = inject(Authentication);
  
  public lessons: any[] = [];
  public loading = true;
  public showCreateForm = false;
  public createForm = inject(FormBuilder).group({
    title: ['', Validators.required],
    description: [''],
    start: ['', Validators.required],
    end: ['', Validators.required],
    platform: ['teams', Validators.required],
    link: ['', Validators.required],
    target_type: ['class', Validators.required], // class, group, student
    target_id: [null, Validators.required],
    subject_id: [null]
  });

  public classes: any[] = []; // Load these if teacher
  public groups: any[] = []; // Load these if teacher

  ngOnInit(): void {
    this.loadLessons();
    if (this.auth.getRole() === 'teacher') {
        this.loadClassesAndGroups();
    }
  }

  loadLessons() {
    this.http.get<any[]>(`${Config.API_URL}/v1/online/lessons`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.lessons = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  generateLink() {
      const val = this.createForm.value;
      if (!val.title || !val.start || !val.end || !val.platform) {
          alert(this.l.s('online.fill_required'));
          return;
      }
      
      this.http.post<any>(`${Config.API_URL}/v1/online/generate`, {
          platform: val.platform,
          title: val.title,
          start: val.start,
          end: val.end
      }, { withCredentials: true }).subscribe({
          next: (res) => {
              if (res.link) {
                  this.createForm.patchValue({ link: res.link });
              } else if (res.error === 'not_connected') {
                  if (confirm(this.l.s('online.connect_prompt', { provider: res.provider }))) {
                      this.connectAccount(res.provider);
                  }
              } else {
                  alert('Error: ' + JSON.stringify(res));
              }
          },
          error: (err) => console.error(err)
      });
  }

  connectAccount(provider: string) {
      this.http.get<any>(`${Config.API_URL}/v1/auth/${provider}/connect`, { withCredentials: true })
        .subscribe((res) => {
            if (res.url) {
                window.location.href = res.url;
            }
        });
  }

  loadClassesAndGroups() {
      // Fetch classes and groups for dropdowns - placeholder logic or fetch from existing API
      // Usually teacher has access to classes.
      // For now, we might need an endpoint or use existing ones.
      // Assuming teacher knows IDs or we fetch from /teach/my-classes etc.
      // Let's just fetch simplified list if possible.
      // Existing APIs?
  }

  toggleCreate() {
    this.showCreateForm = !this.showCreateForm;
  }

  createLesson() {
    if (this.createForm.invalid) return;
    
    // Convert to ISO or required format
    const val = this.createForm.value;
    
    this.http.post(`${Config.API_URL}/v1/online/lessons`, val, { withCredentials: true })
      .subscribe({
        next: () => {
          this.showCreateForm = false;
          this.createForm.reset({ platform: 'teams', target_type: 'class' });
          this.loadLessons();
        },
        error: (err) => console.error(err)
      });
  }

  deleteLesson(id: number) {
      if (!confirm(this.l.s('delete'))) return;
      this.http.delete(`${Config.API_URL}/v1/online/lessons/${id}`, { withCredentials: true })
        .subscribe(() => this.loadLessons());
  }

  openLink(url: string) {
      window.open(url, '_blank');
  }

  isTeacher() {
      return this.auth.getRole() === 'teacher';
  }
}
