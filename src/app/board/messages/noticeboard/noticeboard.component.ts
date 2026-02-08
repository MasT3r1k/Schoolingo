import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { AddNoteComponent } from './modals/add-note/add-note.component';
import { Permission } from '@Schoolingo/permission';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ViewNoteComponent } from './modals/view-note/view-note.component';
import { NoticeboardService } from './noticeboard.service';

interface Announcement {
  message_id: number;
  author_id: number;
  author: {
    first_name: string;
    last_name: string;
    full_name: string;
  };
  topic: string;
  message: string;
  sent_at: Date;
  deleted: boolean;
  require_confirm: boolean;
  read_at: Date | null;
  confirmed_at: Date | null;
}

@Component({
  selector: 'app-noticeboard',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './noticeboard.component.html',
  styleUrl: './noticeboard.component.css'
})
export class NoticeboardComponent implements OnInit {
  private http = inject(HttpClient);
  public perms = inject(Permission);
  private noticeboardService = inject(NoticeboardService);
  public l = inject(Locale);
  public announcements: Announcement[] = [];
  public modalManager = inject(ModalManager);
  Utils = Utils;

  ngOnInit(): void {
    this.modalManager.addModal(
      'add_message_to_noticeboard',
      {
        title: 'messages.new_announcement',
        closeable: true,
        items: [
          {
            type: 'component',
            component: AddNoteComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
        'view_note',
        {
          title: 'messages.details', // Ensure this locale key exists or use a generic one
          closeable: true,
          width: 800,
          items: [
            {
              type: 'component',
              component: ViewNoteComponent
            }
          ]
        }
    )

    this.http.get(
      `${Config.API_URL}/v1/messages/noticeboard`,
      { withCredentials: true }
    ).subscribe((data) => {
      if ('messages' in data) {
        this.announcements = data.messages as Announcement[];
      }
      console.log(data)
    })
  }

  public openNewNote(): void {
    this.modalManager.openModal('add_message_to_noticeboard');
  }

  public openNote(note: Announcement): void {
    this.noticeboardService.selectedMessageId = note.message_id;
    this.modalManager.openModal('view_note');

    if (!note.read_at) {
        this.readNoticeboard(note.message_id);
    }
  }

  public readNoticeboard(message_id: number): void {
    this.http.post(
      `${Config.API_URL}/v1/messages/update`,
      { message_id, read: true },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      const note = this.announcements.find((note) => note.message_id == data.message_id);
      if (!note) return;
      note.read_at = data.read_at;
    })
  }
}
