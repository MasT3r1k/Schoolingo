import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { UploadFile, UploadService } from '@Schoolingo/upload';
import { Utils } from '@Schoolingo/utils';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-upload-files-modal',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './upload-files-modal.component.html',
  styleUrls: ['./upload-files-modal.component.css', '../../Styles/upload.css', '../modal/modal.css']
})
export class UploadFilesModalComponent implements OnInit {
  public Utils = Utils;
  public l = inject(Locale)
  private uploadService = inject(UploadService);
  public modalManager = inject(ModalManager);

  public files: UploadFile[] = [];
  public isDragging = false;
  public modalId: string = '';
  public origin: string = 'default';
  
  public config = {
    file_max_size_in_mb: 50,
    files_limit: 10,
    supported_files: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt'
  };

  ngOnInit(): void {
    // Find our modal naturally
    const modal = this.modalManager.getModals().find(m => m.isOpen && m.items.some(i => i.component === UploadFilesModalComponent));
    if (modal) {
        this.modalId = modal.id;
        
        // Automatically set consistent title and icon
        this.modalManager.updateModal(this.modalId, 'title', 'documents.upload_files');
        this.modalManager.updateModal(this.modalId, 'icon', 'cloud-upload');

        if (modal.data) {
            this.files = modal.data.files || [];
            this.origin = modal.data.origin || 'default';
            if (modal.data.config) {
                this.config = { ...this.config, ...modal.data.config };
            }
        }
    }
  }

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

      uploadFile.subscription = this.uploadService.uploadFiles([file], this.origin)
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

    if (!this.config.supported_files.includes(ext.toLowerCase())) {
      return 'format_not_supported';
    }

    const maxSizeBytes = this.config.file_max_size_in_mb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return 'file_too_big';
    }
    return null;
  }

  public getFileProgress(file: UploadFile): number {
    if (file.error) return 100;
    return file.progress;
  }

  public checkFilesUploaded(): boolean {
    return this.files.every(f => f.progress === 100);
  }

  public checkFilesError(): number {
    return this.files.filter((file) => file.status == 'error').length;
  }

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

  private shakeModal(): void {
    if (this.modalId) {
        const modalEl = document.querySelector(`.modal#${this.modalId}`);
        modalEl?.classList.add('animate-shake');
        setTimeout(() => {
            modalEl?.classList.remove('animate-shake');
        }, 500);
    }
  }

  public closeModal(): void {
    if (!this.checkFilesUploaded()) {
      this.shakeModal();
      return;
    }
    this.modalManager.closeModal(this.modalId);
  }

  public assignFiles(): void {
    if (!this.checkFilesUploaded()) {
      this.shakeModal();
      return;
    }
    
    const modalData = this.modalManager.getModalData(this.modalId);
    if (modalData) {
        const finalFiles = this.files.filter(file => !file.error);
        if (modalData.onAssign) {
            modalData.onAssign(finalFiles);
        } else {
            modalData.files = finalFiles;
        }
    }

    this.modalManager.closeModal(this.modalId);
  }
}
