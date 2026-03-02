import { Component, inject, OnInit } from '@angular/core';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ClassItem } from '../../classes.component';

@Component({
  selector: 'app-remove-class',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './remove-class.component.html',
  styleUrl: './remove-class.component.css'
})
export class RemoveClassComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public cls?: ClassItem;
  public selected_option = 0;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('remove_class');
    this.cls = data.class;
  }

  public getActionIcon(): string {
    switch (this.selected_option) {
      case 0: return 'archive';
      case 1: return 'trash';
    }
    return 'trash';
  }

  public getActionText(): string {
    switch (this.selected_option) {
      case 0: return 'Deaktivovat třídu';
      case 1: return 'Smazat třídu';
    }
    return 'Smazat třídu';
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove_class');
  }

  public confirmDelete(): void {
    if (!this.cls) return;

    if (this.selected_option === 0) {
      alert('Funkce deaktivace třídy není v tuto chvíli implementována v backendu.');
      return;
    }

    if (this.selected_option === 1) {
      this.http.delete(`${Config.API_URL}/v1/school/classes/${this.cls.id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.modalManager.closeModal('remove_class');
          window.location.reload();
        },
        error: (err) => {
          console.error('Failed to delete class:', err);
          alert('Nepodařilo se smazat třídu.');
        }
      });
    }
  }
}
