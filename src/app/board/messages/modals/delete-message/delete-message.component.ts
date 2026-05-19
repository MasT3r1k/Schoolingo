import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Message } from '../../template/template.component';

@Component({
  selector: 'app-delete-message',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './delete-message.component.html',
  styleUrl: './delete-message.component.css'
})
export class DeleteMessageComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);
  
  public declare message: Message;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('delete_message');
    this.message = data.message[0];
    console.log(this.message);
  }

  public closeModal(): void {
    this.modalManager.closeModal('delete_message');
  }

  public confirmDelete(): void {
    if (!this.message) return;
    const data = this.modalManager.getModalData('delete_message');
    data.onDelete();
    this.closeModal();
  }
}
