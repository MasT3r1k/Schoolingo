
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.css']
})
export class ChangelogModalComponent implements OnInit {
  public Config = Config;
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);

  public changelog: { version: string; date: string; changes: string[]; type: 'major' | 'minor' | 'patch' }[] = [];
  public isLoading = true;

  ngOnInit(): void {
      this.http.get<any[]>(`${Config.API_URL}/v1/changelog`, { withCredentials: true }).subscribe({
          next: (data) => {
              this.changelog = data;
              this.isLoading = false;
          },
          error: (err) => {
              console.error('Failed to load changelog', err);
              this.isLoading = false;
          }
      });
  }

  public close(): void {
    this.modalManager.closeModal('changelog');
  }
}
