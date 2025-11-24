import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Documents, FileItem, FolderItem } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Utils } from '@Schoolingo/utils';
import { CreateFolderComponent } from './modals/create-folder/create-folder.component';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { UploadFilesComponent } from './modals/upload-files/upload-files.component';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, IconsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public documents = inject(Documents);
  public file: FileItem | FolderItem | null = null;
  public expandedFolders = new Set<string>();
  private modalManager = inject(ModalManager);
  Utils = Utils;

  ngOnInit(): void {
    this.modalManager.addModal(
      'create_folder',
      {
        title: 'documents.create_folder',
        closeable: true,
        items: [
          {
            type: 'component',
            component: CreateFolderComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'upload_files',
      {
        title: 'documents.upload_files',
        closeable: true,
        items: [
          {
            type: 'component',
            component: UploadFilesComponent
          }
        ]
      }
    )

    this.http.post<any[]>(
      `${Config.API_URL}/v1/documents/files`,
      {
        parent_id: this.documents.getSelectedFolder()?.parent_id || null
      },
      { withCredentials: true }
    )
    .subscribe((data: any[]) => {
      data.forEach((file) => {
        this.documents.addFile(file);
      })
      // console.log(data)
    });

    this.documents.selectedFile$.subscribe((file) => this.file = file);
    // Expand root folders by default
    const tree = this.documents.getTree();
    tree.forEach((item: any) => {
      if (item.id) {
        this.expandedFolders.add(item.id);
      }
    });
  }

  public openCreationFolder(): void {
    this.modalManager.openModal('create_folder');
  }

  public openUploadFiles(): void {
    this.modalManager.openModal('upload_files');
  }

  public toggleFolder(item: any, event: Event): void {
    event.stopPropagation();
    if (this.expandedFolders.has(item.file_id)) {
      this.expandedFolders.delete(item.file_id);
    } else {
      this.expandedFolders.add(item.file_id);
    }
  }

  public isFolderExpanded(item: any): boolean {
    return this.expandedFolders.has(item.file_id);
  }

  public uploadFile() {
      // TODO: Open modal
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e: any) => {
          if (e.target.files.length > 0) {
            //   this.documentService.uploadFile(e.target.files[0], null).subscribe();
          }
      };
      input.click();
  }
}
