import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Documents, FileItem, FolderItem } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, IconsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  public l = inject(Locale);
  public documents = inject(Documents);
  public file: FileItem | FolderItem | null = null;
  Utils = Utils;

  ngOnInit(): void {
    this.documents.selectedFile$.subscribe((file) => this.file = file);
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
