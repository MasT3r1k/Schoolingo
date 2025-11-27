import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Documents, FileItem, FolderItem } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Utils } from '@Schoolingo/utils';
import { CreateFolderComponent } from './modals/create-folder/create-folder.component';
import { UploadFilesComponent } from './modals/upload-files/upload-files.component';
import { ContextMenu, ContextMenuItem } from '@Schoolingo/context-menu';
import { CreateFileComponent } from './modals/create-file/create-file.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  public context_menu = inject(ContextMenu);
  public l = inject(Locale);
  public layout: 'list' | 'grid' = 'grid';
  public documents = inject(Documents);
  public file: FileItem | FolderItem | null = null;
  public searchFiles: (FileItem | FolderItem)[] = [];
  public search = new FormControl('');
  public expandedFolders = new Set<string | null>();
  private modalManager = inject(ModalManager);
  Utils = Utils;

  public toggleLayout(): void {
    this.layout = this.layout == 'grid' ? 'list' : 'grid';
  }

  public refreshFiles(): void {
    this.documents.loadFiles(this.documents.getSelectedFolder()?.file_id ?? null)
  }

  public rightClickOnGrid(event: MouseEvent): void {
    event.preventDefault();
    let items: ContextMenuItem[] = [];

    items.push(
      {
        text: 'documents.new_folder',
        action: () => { this.context_menu.hideContextMenu();this.openCreationFolder(); }
      },
      {
        text: 'documents.new_file',
        action: () => { this.context_menu.hideContextMenu();this.openCreationFile(); }
      },
      {
        text: 'documents.upload_files'
      }
    )

    this.context_menu.setItems(items);
    this.context_menu.showContextMenu(event.x, event.y);
  }

  public rightClickOnItem(file_id: number | null, event: MouseEvent): void {
    event.preventDefault();
    let items: ContextMenuItem[] = [];
    const file = this.documents.getFile(file_id);
    if (!file) {
      return;
    }

    if (file.type == 'folder') {
      items.push({
        text: 'documents.open_folder',
        action: () => {this.documents.selectFolder(file);this.context_menu.hideContextMenu()}
      },
      {
        text: 'documents.create_folder',
        action: () => {this.documents.selectFolder(file);this.openCreationFolder();this.context_menu.hideContextMenu()}
      },
      {
        text: 'documents.create_file',
        action: () => {this.documents.selectFolder(file);this.openCreationFile();this.context_menu.hideContextMenu()}
      })
    }

    if (file.file_id !== null) {
      items.push(
        {
          text: 'documents.rename_file',
          action: () => {this.context_menu.hideContextMenu();this.renameFile(file)}
        },
        {
          text: 'documents.permissions_file'
        },
        {
          text: 'documents.delete_file',
          color: 'danger'
        }
      )
    } 

    this.context_menu.setItems(items);

    this.context_menu.showContextMenu(event.x, event.y);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.file == null) return;
    switch (event.key) {
      case 'ArrowUp':
        let fileUpIndex = this.documents.getFiles().findIndex((file) => file.file_id == this.file?.file_id);
        if (fileUpIndex <= 0) {
          return;
        }
        event.preventDefault();
        this.documents.showProperties(this.documents.getFiles()[fileUpIndex - 1]);
        break;

      case 'ArrowDown':
        let fileDownIndex = this.documents.getFiles().findIndex((file) => file.file_id == this.file?.file_id);
        if (fileDownIndex + 1 >= this.documents.getFiles().length) {
          return;
        }
        event.preventDefault();
        this.documents.showProperties(this.documents.getFiles()[fileDownIndex + 1]);
        break;
      
      case 'Enter':
        let fileEnterIndex = this.documents.getFiles().findIndex((file) => file.file_id == this.file?.file_id);
        let fileEnter = this.documents.getFile(this.file.file_id);
        if (fileEnter.type == 'folder') {
          this.documents.selectFolder(fileEnter, 0);
        }
    }
  }

  ngOnInit(): void {
    this.expandedFolders.add(null)

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
      'create_file',
      {
        title: 'documents.create_file',
        closeable: true,
        items: [
          {
            type: 'component',
            component: CreateFileComponent
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

    this.modalManager.addModal(
      'rename_file',
      {
        title: 'documents.rename_file',
        closeable: true,
        items: [
          {
            type: 'component',
            component: RenameFileComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'delete_file',
      {
        title: 'documents.delete_file',
        closeable: true,
        items: [
          {
            type: 'component',
            component: DeleteFileComponent
          }
        ]
      }
    )

    this.documents.currentFolder$.subscribe((data: any) => {
      console.log(data)
      const tree = this.documents.getTree();
      tree.forEach((item: any) => {
        if (data.file_id) {
          this.expandedFolders.add(data.file_id);
        }
      });
    });

    this.documents.loadFiles(this.documents.getSelectedFolder()?.parent_id || null);
  }

  public openCreationFolder(): void {
    this.modalManager.openModal('create_folder');
  }

  public openCreationFile(): void {
    this.modalManager.openModal('create_file');
  }

  public openUploadFiles(): void {
    this.modalManager.openModal('upload_files');
  }

  public toggleFolder(item: any, event: Event): void {
    event.stopPropagation();
    if (this.expandedFolders.has(item.file_id)) {
      this.expandedFolders.delete(item.file_id);
    } else {
      if (!item.children || !item.children.length) {
        this.documents.loadFiles(item.file_id);
      }
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
