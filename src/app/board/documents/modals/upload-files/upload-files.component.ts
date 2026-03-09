import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { Documents } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { UploadFile, UploadService } from '@Schoolingo/upload';
import { Utils } from '@Schoolingo/utils';
import { finalize } from 'rxjs';

@Component({
  imports: [IconsModule],
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css', '../../../../Styles/upload.css']
})
export class UploadFilesComponent {
  public Utils = Utils;
  public l = inject(Locale)
  private uploadService = inject(UploadService);
  private documents = inject(Documents);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  
  public files: UploadFile[] = [];
  public isDragging = false;

  public assignFiles(file_ids: number[]): void {
    const folderId = this.documents.getSelectedFolder()?.document_id;
    this.http.post(
      `${Config.API_URL}/v1/documents/assignfiles`,
      {
        file_ids,
        parent_id: folderId
      },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      if (data.success) {
        this.modalManager.closeModal('upload_files')
        this.documents.loadFiles(folderId ?? null)
      }
    });
  }

  /**
   * Handle files dropped or selected
   * @param fileList List of files
   */
  handleFiles(fileList: FileList): void {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach(file => {
      const exists = this.files.some(f =>
        f.file.name === file.name &&
        f.file.size === file.size &&
        f.file.lastModified === file.lastModified
      );
      if (exists) return;

      const error = this.checkFile(file);

      const uploadFile: UploadFile = {
        file,
        progress: error ? 100 : 0,
        status: error ? 'error' : 'pending',
        error: error ?? undefined
      };

      this.files.push(uploadFile);

      if (error) return;

      uploadFile.status = 'uploading';

      this.uploadService.uploadFiles([file], 'documents')
        .pipe(
          finalize(() => {
            if (uploadFile.status === 'uploading') {
              uploadFile.status = 'done';
              uploadFile.progress = 100;
            }
          })
        )
        .subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              uploadFile.progress = Math.round(
                (event.loaded / event.total) * 100
              );
            }

            if (event.type === HttpEventType.Response) {
              const uploaded = event.body?.files?.[0];
              if (uploaded) {
                uploadFile.serverId = uploaded.id;
                uploadFile.status = 'done';
                uploadFile.progress = 100;
              }
            }
          },
          error: err => {
            uploadFile.status = 'error';
            uploadFile.error = 'Chyba při nahrávání';
            console.error(err);
          },
        });
    });
  }

  public assignAllFiles(): void {
    const file_ids = this.files.filter((f) => f.serverId != null).map((f) => Number(f.serverId));
    if (file_ids.length > 0) {
      this.assignFiles(file_ids);
    }
  }

  public checkFile(file: File): string | null {
    return null;
  }

  public getFileIcon = this.uploadService.getFileIcon;


  public getFileProgress(file: UploadFile): number {
    if (file.error) {
      // Error state
      return 100;
    }
    return file.progress;
  }

  public checkFilesUploaded(): boolean {
    return this.files.every(f => f.progress === 100);
  }

  /**
   * Remove file from list and backend
   * @param index Index of file to remove
   */
  removeFile(index: number): void {
    if (this.files[index].serverId) {
      this.uploadService.removeFile(this.files[index].serverId)
    }
    this.files.splice(index, 1);
  }

  // Drag and Drop Handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }
}
