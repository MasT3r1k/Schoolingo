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
  templateUrl: './create-file.component.html',
  styleUrl: './create-file.component.css'
})
export class CreateFileComponent {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  private documents = inject(Documents);
  public file_name = '';
  public file_content = '';
  public input_errors: any = {};

  public createFile(): void {
    let parent_id = null;
    const selected_folder = this.documents.getSelectedFolder();
    if (selected_folder && selected_folder.document_id != null) {
      parent_id = selected_folder.document_id;
    }

    this.input_errors = {};
    if (this.file_name == '') {
      this.input_errors['name'] = this.l.s('form.required');
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/documents/new_file`,
      { name: this.file_name, parent_id, content: this.file_content },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      if ('error' in data) {
        switch(data.error) {
          case 'file_already_created':
            this.input_errors['name'] = this.l.s('documents.file_already_created')
            break;
        }
      }
      if (data.success !== true) return;
      this.modalManager.closeModal('create_file');
      this.documents.addFile({
        document_id: data.document_id,
        file_id: data.file_id,
        file_uuid: data.file_uuid,
        file_format: data.file_format,
        mime_type: data.mime_type,
        parent_id: data.parent_id,
        name: data.name,
        type: 'file',
        modified_at: data.created_at,
        created_at: data.created_at,
        owner_id: data.owner_id,
        permissions: [],
        can_manage_permissions: true,
        file_size: data.file_size
      })
    })
  }
}
