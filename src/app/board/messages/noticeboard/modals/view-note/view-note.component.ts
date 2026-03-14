import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';
import { NoticeboardService } from '../../noticeboard.service';
import { AvatarService } from '../../../../../infrastructure/utils/avatar.service';


interface MessageDetail {
  message_id: number;
  topic: string;
  message: string;
  sent_at: Date;
  author: {
    first_name: string;
    last_name: string;
    full_name: string;
    avatar: string | null;
  };
  receivers: {
    personId: number;
    firstName: string;
    lastName: string;
    full_name: string;
    groupName: string | null;
    read_at: Date | null;
    confirmed_at: Date | null;
  }[];
  target_groups: string[];
}

@Component({
  selector: 'app-view-note',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './view-note.component.html',
  styleUrl: './view-note.component.css'
})
export class ViewNoteComponent implements OnInit {
  public service = inject(NoticeboardService);
  private http = inject(HttpClient);
  public l = inject(Locale);
  public avatarService = inject(AvatarService);
  public Utils = Utils;
  
  public note: MessageDetail | null = null;
  public loading = false;
  public error = false;

  ngOnInit(): void {
    if (this.service.selectedMessageId) {
      this.loadNote(this.service.selectedMessageId);
    }
  }

  loadNote(id: number): void {
    this.loading = true;
    this.error = false;
    this.http.get<MessageDetail>(`${Config.API_URL}/v1/messages/details/${id}`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.note = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
  }
}
