import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { Documents } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-rename-file',
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './rename-file.component.html',
  styleUrl: './rename-file.component.css'
})
export class RenameFileComponent {
  public l = inject(Locale);
  public documents = inject(Documents);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);

  public saveRename(): void {
    if (!this.documents.renamingFile) return;
    const file = this.documents.renamingFile;
    if (file.document_id == null) return;
    const docId = file.document_id;
    const newName = file.name ?? '';
    this.http.post(
      `${Config.API_URL}/v1/documents/rename_file`,
      { file_id: docId, name: newName },
      { withCredentials: true }
    ).subscribe((data: any) => {
      if (data.success !== false) {
        // Aktualizace v lokálním store
        const files = (this.documents as any)['_files'];
        if (files) {
          const current = files.getValue() as any[];
          const idx = current.findIndex((f: any) => f.document_id === docId);
          if (idx !== -1) {
            current[idx] = { ...current[idx], name: newName };
            files.next([...current]);
          }
        }
        this.modalManager.closeModal('rename_file');
      }
    });
  }
}

