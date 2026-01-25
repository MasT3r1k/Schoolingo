import { HttpEventType } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MessageManager } from '@Schoolingo/messages';
import { ModalManager } from '@Schoolingo/modal';
import { UploadFile, UploadService } from '@Schoolingo/upload';
import { Utils } from '@Schoolingo/utils';
import { finalize } from 'rxjs';

@Component({
  imports: [IconsModule],
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css', '../../../../../Styles/upload.css', '../../../../../Components/modal/modal.css']
})
export class UploadFilesComponent {
  public Utils = Utils;
  public l = inject(Locale)
  private uploadService = inject(UploadService);
  public messageManager = inject(MessageManager);
  public modalManager = inject(ModalManager);

  public files: UploadFile[] = this.messageManager.files;
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

      const error = this.checkFile(file);

      const uploadFile: UploadFile = {
        file,
        progress: error ? 100 : 0,
        status: error ? 'error' : 'pending',
        error: error ?? undefined
      };

      this.files.push(uploadFile);

      if (error != null) return;

      uploadFile.status = 'uploading';

      uploadFile.subscription = this.uploadService.uploadFiles([file], 'messages')
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
                uploadFile.file
                uploadFile.serverId = uploaded.id;
                uploadFile.status = 'done';
                uploadFile.progress = 100;
              }
            }
          },
          error: err => {
            uploadFile.status = 'error';
            uploadFile.error = 'error_while_uploading';
            console.error(err);
          }
        });
    });
  }

  public getFileIcon = this.uploadService.getFileIcon;

  public checkFile(file: File): string | null {
    const uploadFile = this.files.find((f) => f.file == file);
    if (uploadFile && uploadFile.error) {
      return uploadFile.error;
    }

    const ext = file.name.includes('.') 
      ? '.' + file.name.split('.').pop() 
      : '.bin';

    if (!this.messageManager.getConfig().supported_files.includes(ext)) {
      return 'format_not_supported';
    }

    const maxSizeBytes = this.messageManager.getConfig().file_max_size_in_mb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return 'file_too_big';
    }
    return null;
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

  public checkFilesError(): number {
    return this.files.filter((file) => file.status == 'error').length;
  }

  /**
   * Remove file from list and backend
   * @param index Index of file to remove
   */
  removeFile(file: UploadFile): void {
    const index = this.files.indexOf(file);
    if (file.status === 'uploading' && file.subscription) {
      file.subscription.unsubscribe();
      file.status = 'error';
      file.error = 'Nahrávání bylo zrušeno';
    }

    if (file.progress == 100 && file.serverId) {
      this.uploadService.removeFile(file.serverId)
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

  public closeModal(): void {
    if (!this.checkFilesUploaded()) {
      document.querySelector(".modal#sendMessage_files")?.classList.add('animate-shake');
      setTimeout(() => {
        document.querySelector(".modal#sendMessage_files")?.classList.remove('animate-shake');
      }, 500)
      return;
    }

    this.messageManager.files = this.files.filter(file => !file.error || file.error == null);

    this.modalManager.closeModal('sendMessage_files')
  }

  public assignFiles(): void {
    if (!this.checkFilesUploaded()) {
      document.querySelector(".modal#sendMessage_files")?.classList.add('animate-shake');
      setTimeout(() => {
        document.querySelector(".modal#sendMessage_files")?.classList.remove('animate-shake');
      }, 500)
      return;
    }
    
    this.messageManager.files = this.files.filter(file => !file.error || file.error == null);
    this.modalManager.closeModal('sendMessage_files')
  }
}
