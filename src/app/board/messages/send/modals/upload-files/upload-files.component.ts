import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MessageManager } from '@Schoolingo/messages';
import { UploadService } from '@Schoolingo/upload';
import { Utils } from '@Schoolingo/utils';

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

  public files: File[] = [];
  public isDragging = false;

  /**
   * Handle files dropped or selected
   * @param fileList List of files
   */
  handleFiles(fileList: FileList | null): void {
    if (!fileList) return;
    let uploadFiles: FileList = JSON.parse(JSON.stringify(fileList));

    // Convert FileList to Array and filter duplicates if needed
    Array.from(fileList).forEach(file => {
      // Check if file already exists in the list to avoid duplicates
      const exists = this.files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
      if (!exists) {
        this.files.push(file);
      }
    });

    this.uploadService.uploadFiles(fileList).subscribe((data) => {
      console.log(data)
    })
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

  public getFileProgress(file: File): number {
    if (this.checkFile(file) != null) {
      return 100;
    }
    // get upload status

    return 0;
  }

  public checkFilesUploaded(): boolean {
    let uploaded_files = 0;
    this.files.forEach((file: File) => {
      if (this.getFileProgress(file) == 100) {
        uploaded_files++;
      }
    })
    return uploaded_files == this.files.length;
  }

  /**
   * Remove file from list
   * @param index Index of file to remove
   */
  removeFile(index: number): void {
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
