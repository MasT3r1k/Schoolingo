import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Config } from '@Schoolingo/config';
import { Documents } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-delete-file',
  imports: [CommonModule, IconsModule],
  templateUrl: './delete-file.component.html',
  styleUrl: './delete-file.component.css'
})
export class DeleteFileComponent {
  public l = inject(Locale);
  public documents = inject(Documents);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);

  public getFile() {
    return this.documents.getSelectedFile();
  }

  public deleteFile(): void {
    const file = this.documents.getSelectedFile();
    if (!file || file.document_id == null) return;
    const docId = file.document_id;

    this.http.delete(
      `${Config.API_URL}/v1/documents/delete`,
      {
        body: { document_id: docId },
        withCredentials: true
      }
    ).subscribe((data: any) => {
      // Odstraní soubor z lokálního store
      const filesSubject = (this.documents as any)['_files'];
      if (filesSubject) {
        const current = filesSubject.getValue() as any[];
        filesSubject.next(current.filter((f: any) => f.document_id !== docId));
      }
      this.documents.closeProperties();
      this.modalManager.closeModal('delete_file');
    });
  }
}
