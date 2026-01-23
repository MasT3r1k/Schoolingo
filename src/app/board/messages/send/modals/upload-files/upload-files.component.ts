import { HttpEventType } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MessageManager } from '@Schoolingo/messages';
import { UploadService } from '@Schoolingo/upload';
import { Utils } from '@Schoolingo/utils';
import { finalize } from 'rxjs';

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  serverId?: string;
}

@Component({
  imports: [IconsModule],
  templateUrl: './upload-files.component.html',
  styleUrl: './upload-files.component.css'
})
export class UploadFilesComponent {
  public Utils = Utils;
  public l = inject(Locale)
  private uploadService = inject(UploadService);
  public messageManager = inject(MessageManager);

  public files: UploadFile[] = [];
  public isDragging = false;

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

      const error = null //this.checkFile(file);

      const uploadFile: UploadFile = {
        file,
        progress: error ? 100 : 0,
        status: error ? 'error' : 'pending',
        error: error ?? undefined
      };

      this.files.push(uploadFile);

      // if (error) return;

      uploadFile.status = 'uploading';

      this.uploadService.uploadFiles([file])
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
                this.messageManager.attachments.push(uploaded.id);
                uploadFile.status = 'done';
                uploadFile.progress = 100;
              }
            }
          },
          error: err => {
            uploadFile.status = 'error';
            uploadFile.error = 'Chyba při nahrávání';
            console.error(err);
          }
        });
    });
  }

  public checkFile(file: File): string | null {
    const maxSizeBytes = this.messageManager.getConfig().file_max_size_in_mb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return 'Soubor je příliš velký.';
    }
    return null;
  }

  public getFileIcon(file: File): string {
    const parts = file.name.split('.');
    const format = parts.length > 1 ? parts.pop()!.toLowerCase() : null;

    if (!format) return 'file';

    if (['txt', 'docx', 'doc', 'jpg', 'pdf', 'png', 'svg', 'zip'].includes(format)) {
      return 'file-type-' + format;
    }

    if (['gif', 'webp'].includes(format)) {
      return 'photo';
    }

    return 'file';
  }

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
