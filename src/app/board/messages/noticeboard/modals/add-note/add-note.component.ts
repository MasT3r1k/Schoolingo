import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.css'
})
export class AddNoteComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public topic = '';
  public message = '';

  ngOnInit(): void {
  }

  public new_noticeboard(): void {
    this.http.post(
      `${Config.API_URL}/v1/messages/new_noticeboard`,
      { topic: this.topic, message: this.message },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('success' in data && data.success) {
        this.modalManager.closeModal('add_message_to_noticeboard');
      }
    })
  }
}
