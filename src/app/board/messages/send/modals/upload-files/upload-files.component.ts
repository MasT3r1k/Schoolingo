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

    // Convert FileList to Array and filter duplicates if needed
    Array.from(fileList).forEach(file => {
      // Check if file already exists in the list to avoid duplicates
      const exists = this.files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
      if (!exists) {
        this.files.push(file);
      }
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
    const format_file = file.name.split('.')[-1];
    if (['txt', 'docx', 'jpg', 'pdf', 'png', 'svg', 'zip'].includes(format_file)) {
      return 'file-type-' + format_file;
    }
    return 'file';
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
