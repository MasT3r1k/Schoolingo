import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Documents, FileItem, FolderItem } from '@Schoolingo/documents';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Utils } from '@Schoolingo/utils';
import { CreateFolderComponent } from './modals/create-folder/create-folder.component';
import { UploadFilesModalComponent } from '@Components/upload-files-modal/upload-files-modal.component';
import { ContextMenu, ContextMenuItem } from '@Schoolingo/context-menu';
import { CreateFileComponent } from './modals/create-file/create-file.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteFileComponent } from './modals/delete-file/delete-file.component';
import { RenameFileComponent } from './modals/rename-file/rename-file.component';
import { SidebarItem } from '../board.component';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Config } from '@Schoolingo/config';
import { PermissionsComponent } from './modals/permissions/permissions.component';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css', '../../Styles/sidebar.css']
})
export class DocumentsComponent implements OnInit {
  public dropdownManager = inject(DropdownManager);
  addDropdown: SidebarItem[] = [
    {
      icon: 'folder-plus',
      item: 'documents.create_folder',
      action: () => { this.dropdownManager.selected_dropdown = '';this.openCreationFolder(); }
    },
    {
      icon: 'file-plus',
      item: 'documents.create_file',
      action: () => { this.dropdownManager.selected_dropdown = '';this.openCreationFile(); }
    }
  ];
  public context_menu = inject(ContextMenu);
  public l = inject(Locale);
  public layout: 'list' | 'grid' = 'grid';
  public documents = inject(Documents);
  public file: FileItem | FolderItem | null = null;
  public searchFiles: (FileItem | FolderItem)[] = [];
  public search = new FormControl('');
  public expandedFolders = new Set<string | null>();
  public get canWrite(): boolean {
    const folder = this.documents.getSelectedFolder();
    if (folder === null) return true; // Root is usually writable
    return folder.permissions.includes('WRITE');
  }

  public get isRefreshing(): boolean {
    return this.documents.isRefreshing$.getValue();
  }
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  Utils = Utils;
  Config = Config;

  public get skeletonItems(): number[] {
    const count = this.documents.getSelectedFolder()?.files_count ?? 5;
    return Array(count > 0 ? count : 5).fill(0);
  }


  public toggleLayout(): void {
    this.layout = this.layout == 'grid' ? 'list' : 'grid';
  }

  public refreshFiles(): void {
    if (this.isRefreshing) return;
    this.documents.loadFiles(this.documents.getSelectedFolder()?.document_id ?? null)
  }

  public rightClickOnGrid(event: MouseEvent): void {
    event.preventDefault();
    let items: ContextMenuItem[] = [];

    if (this.canWrite) {
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
          text: 'documents.upload_files',
          action: () => {this.context_menu.hideContextMenu();this.openUploadFiles()}
        }
      )
    }

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

    this.documents.showProperties(file);

    if (file.type == 'folder') {
      items.push({
        text: 'documents.open_folder',
        action: () => {this.documents.selectFolder(file);this.context_menu.hideContextMenu()}
      })
    }

    if (file.file_id !== null) {
      items.push(
        {
          text: 'documents.rename_' + file.type,
          action: () => {this.context_menu.hideContextMenu();this.renameFile(file)}
        },
        ...(file.can_manage_permissions ? [{
          text: 'documents.permissions_file',
          action: () => {this.context_menu.hideContextMenu();this.openManagePermissions(file)}
        }] : []),
        {
          icon: 'trash-x',
          text: 'documents.delete',
          color: 'danger',
          action: () => {this.context_menu.hideContextMenu();this.deleteFile(file)}
        }
      )
    } 

    this.context_menu.setItems(items);

    this.context_menu.showContextMenu(event.x, event.y);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const selected_file = this.documents.getSelectedFile();
    if (selected_file == null) return;
    switch (event.key) {
      case 'ArrowUp':
        let fileUpIndex = this.documents.getFiles().findIndex((file) => file.document_id == selected_file?.document_id);
        if (fileUpIndex <= 0) {
          return;
        }
        event.preventDefault();
        this.documents.showProperties(this.documents.getFiles()[fileUpIndex - 1]);
        break;

      case 'ArrowDown':
        let fileDownIndex = this.documents.getFiles().findIndex((file) => file.document_id == selected_file?.document_id);
        if (fileDownIndex + 1 >= this.documents.getFiles().length) {
          return;
        }
        event.preventDefault();
        this.documents.showProperties(this.documents.getFiles()[fileDownIndex + 1]);
        break;
      
      case 'Enter':
        if (selected_file.type == 'folder') {
          this.documents.selectFolder(selected_file, 0);
        }
    }
  }

  ngOnInit(): void {
    this.expandedFolders.add(null)
    this.documents.selectFolder(null)

    this.modalManager.addModal(
      'create_folder',
      {
        title: 'documents.create_folder',
        icon: 'folder-plus',
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
        icon: 'file-plus',
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
        closeable: true,
        title: 'documents.upload_files',
        icon: 'cloud-upload',
        items: [
          {
            type: 'component',
            component: UploadFilesModalComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'rename_file',
      {
        title: 'documents.rename_file',
        icon: 'pencil',
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
        icon: 'trash-x',
        closeable: true,
        items: [
          {
            type: 'component',
            component: DeleteFileComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'manage_permissions',
      {
        title: 'documents.permissions_file',
        icon: 'lock',
        closeable: true,
        items: [
          {
            type: 'component',
            component: PermissionsComponent
          }
        ]
      }
    )

    this.documents.currentFolder$.subscribe((data: any) => {
      const tree = this.documents.getTree();
      tree.forEach((item: any) => {
        if (data && 'document_id' in data) {
          this.expandedFolders.add(data.document_id);
        }
      });
    });
  }

  public openCreationFolder(): void {
    this.modalManager.openModal('create_folder');
  }

  public openCreationFile(): void {
    this.modalManager.openModal('create_file');
  }

  public openUploadFiles(): void {
    this.modalManager.openModal('upload_files', {
        files: [],
        origin: 'documents',
        onAssign: (files: any[]) => {
            const file_ids = files.filter((f) => f.serverId != null).map((f) => Number(f.serverId));
            if (file_ids.length > 0) {
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
                        this.documents.loadFiles(folderId ?? null)
                    }
                });
            }
        }
    });
  }

  public renameFile(file: FileItem | FolderItem): void {
    this.documents.renamingFile = JSON.parse(JSON.stringify(file));
    this.modalManager.updateModal('rename_file', 'title', 'documents.rename_' + file.type);
    this.modalManager.openModal('rename_file');
  }

  public deleteFile(file: FileItem | FolderItem): void {
    console.log(file);
    this.modalManager.openModal('delete_file');
  }

  public openManagePermissions(file: FileItem | FolderItem): void {
    this.documents.showProperties(file);
    this.modalManager.openModal('manage_permissions');
  }

  public toggleFolder(item: any, event: Event): void {
    event.stopPropagation();
    if (this.expandedFolders.has(item.document_id)) {
      this.expandedFolders.delete(item.document_id);
    } else {
      if (!item.children || !item.children.length) {
        this.documents.loadFiles(item.document_id);
      }
      this.expandedFolders.add(item.document_id);
    }
  }

  public isFolderExpanded(item: any): boolean {
    return this.expandedFolders.has(item.document_id);
  }
}
