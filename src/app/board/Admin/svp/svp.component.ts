import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Utils } from '@Schoolingo/utils';
import { AlertManager } from '@Schoolingo/alert';

@Component({
  selector: 'app-svp',
  standalone: true,
  imports: [IconsModule, FormsModule, NgClass],
  templateUrl: './svp.component.html',
  styleUrl: './svp.component.css'
})
export class SvpComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private alertManager = inject(AlertManager);
  Utils = Utils;

  public svps: any[] = [];
  public selectedSvp: any = null;
  public isEditing = false;
  public subjects: any[] = [];

  ngOnInit(): void {
    this.loadSvps();
    this.loadSubjects();
  }

  loadSvps() {
    this.http.get<any[]>(`${Config.API_URL}/v1/school/svp`, { withCredentials: true })
      .subscribe(data => this.svps = data);
  }

  loadSubjects() {
    this.http.get<any[]>(`${Config.API_URL}/v1/school/architecture/subjects`, { withCredentials: true })
      .subscribe(data => this.subjects = data);
  }

  selectSvp(svp: any) {
    this.http.get(`${Config.API_URL}/v1/school/svp/${svp.svp_id}`, { withCredentials: true })
      .subscribe(data => {
        this.selectedSvp = data;
        this.isEditing = true;
      });
  }

  createNewSvp() {
    this.selectedSvp = {
      name: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: null,
      subjects: []
    };
    this.isEditing = true;
  }

  addSubjectToSvp() {
    const svp_id = this.selectedSvp.svp_id;
    if (!svp_id) {
       this.alertManager.alert('error', 'Nejdříve uložte základní informace o ŠVP');
       return;
    }
    const subjectId = prompt('ID Předmětu:');
    const grade = prompt('Ročník:');
    if (subjectId && grade) {
        this.http.post(`${Config.API_URL}/v1/school/svp/subject`, {
            svp_id,
            subject_id: parseInt(subjectId),
            grade: parseInt(grade)
        }, { withCredentials: true }).subscribe(() => {
            this.selectSvp(this.selectedSvp);
        });
    }
  }

  addTopicToSubject(subject: any) {
    const name = prompt(this.l.s('svp.topic_name') + ':');
    if (name) {
        this.http.post(`${Config.API_URL}/v1/school/svp/topic`, {
            svp_subject_id: subject.svp_subject_id,
            name,
            description: '',
            outcomes: '',
            hours_allocated: 1
        }, { withCredentials: true }).subscribe(() => {
            this.selectSvp(this.selectedSvp);
        });
    }
  }

  saveSvp() {
    if (!this.selectedSvp.svp_id) {
      this.http.post(`${Config.API_URL}/v1/school/svp`, this.selectedSvp, { withCredentials: true })
        .subscribe((res: any) => {
          this.selectedSvp.svp_id = res.svp_id;
          this.alertManager.alert('success', 'ŠVP založeno');
          this.loadSvps();
        });
    } else {
        // Update logic could be here
        this.alertManager.alert('success', 'ŠVP uloženo');
        this.isEditing = false;
        this.selectedSvp = null;
    }
  }
}
