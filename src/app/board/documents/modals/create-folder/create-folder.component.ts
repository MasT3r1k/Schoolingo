import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { Documents } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-folder.component.html',
  styleUrl: './create-folder.component.css'
})
export class CreateFolderComponent {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  private documents = inject(Documents);
  public folder_name = '';
  public input_errors: any = {};

  public createFolder(): void {
    let parent_id = null;
    const selected_folder = this.documents.getSelectedFolder();
    if (selected_folder && selected_folder.file_id != null) {
      parent_id = selected_folder.file_id;
    }

    this.input_errors = {};
    if (this.folder_name == '') {
      this.input_errors['name'] = this.l.s('form.required');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/documents/new_folder`,
      { name: this.folder_name, parent_id },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      if ('error' in data) {
        switch(data.error) {
          case 'folder_already_created':
            this.input_errors['name'] = this.l.s('documents.folder_already_created')
            break;
        }
      }
      if (data.success !== true) return;
      this.modalManager.closeModal('create_folder');
      this.documents.addFile({
        document_id: data.document_id,
        file_id: data.file_id,
        file_uuid: null,
        file_format: null,
        mime_type: '',
        parent_id: data.parent_id,
        name: data.name,
        type: 'folder',
        modified_at: data.created_at,
        created_at: data.created_at,
        owner_id: data.owner_id,
        permissions: [],
        file_size: 0
      })
    })
  }
}
