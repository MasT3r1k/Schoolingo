import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// --- Models ---

export type FileType = 'folder' | 'image' | 'video' | 'pdf' | 'doc' | 'sheet' | 'unknown';

export interface Permission {
  type: 'all_students' | 'specific_students' | 'no_students' | 'all_teachers' | 'specific_teachers' | 'nobody_else';
  specificIds?: number[]; // IDs of specific users if applicable
}

export interface FileItem {
  id: number;
  parentId: number | null; // null for root
  name: string;
  type: FileType;
  size?: number; // in bytes
  modified: Date;
  permissions: Permission;
  ownerId: number;
  content?: string; // For mock purposes, maybe a URL or base64
}

export interface FolderItem extends FileItem {
  type: 'folder';
  children?: (FileItem | FolderItem)[];
  expanded?: boolean; // For tree view state
}

// --- Service ---

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private _files = new BehaviorSubject<(FileItem | FolderItem)[]>([]);
  public files$ = this._files.asObservable();

  private _currentFolder = new BehaviorSubject<FolderItem | null>(null);
  public currentFolder$ = this._currentFolder.asObservable();

  private _selectedFile = new BehaviorSubject<FileItem | FolderItem | null>(null);
  public selectedFile$ = this._selectedFile.asObservable();

  // New subject to handle tree expansion requests from other components
  private _expandFolderRequest = new BehaviorSubject<number | null>(null);
  public expandFolderRequest$ = this._expandFolderRequest.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    const mockData: (FileItem | FolderItem)[] = [
      {
        id: 1,
        parentId: null,
        name: 'Dokumenty školy',
        type: 'folder',
        modified: new Date(),
        ownerId: 1,
        permissions: { type: 'all_teachers' },
        size: 0,
        expanded: false
      },
      {
        id: 2,
        parentId: null,
        name: 'Fotogalerie',
        type: 'folder',
        modified: new Date(),
        ownerId: 1,
        permissions: { type: 'all_students' },
        size: 0,
        expanded: false
      },
      {
        id: 3,
        parentId: 1,
        name: 'Řád školy.pdf',
        type: 'pdf',
        modified: new Date(),
        ownerId: 1,
        permissions: { type: 'all_students' },
        size: 1024 * 500 // 500KB
      },
      {
        id: 4,
        parentId: 1,
        name: 'Rozvrh 2024.xlsx',
        type: 'sheet',
        modified: new Date(),
        ownerId: 1,
        permissions: { type: 'all_teachers' },
        size: 1024 * 20
      },
      {
        id: 5,
        parentId: 2,
        name: 'Výlet 2023.jpg',
        type: 'image',
        modified: new Date(),
        ownerId: 1,
        permissions: { type: 'all_students' },
        size: 1024 * 2500
      }
    ];
    this._files.next(mockData);
  }

  getFiles(parentId: number | null): Observable<(FileItem | FolderItem)[]> {
    // In a real app, this would be an HTTP call
    // Here we filter the local state
    const files = this._files.getValue().filter(f => f.parentId === parentId);
    return of(files);
  }

  getAllFiles(): (FileItem | FolderItem)[] {
      return this._files.getValue();
  }

  setCurrentFolder(folder: FolderItem | null) {
    this._currentFolder.next(folder);
    this._selectedFile.next(null); // Deselect when changing folder
    
    // If we are setting a current folder, we might want to ensure it is expanded in the tree
    if (folder) {
        this.requestExpandFolder(folder.id);
        // Also expand parents? That would require traversing up.
        this.expandParents(folder.id);
    }
  }

  expandParents(folderId: number) {
      const allFiles = this._files.getValue();
      const folder = allFiles.find(f => f.id === folderId);
      if (folder && folder.parentId) {
          this.requestExpandFolder(folder.parentId);
          this.expandParents(folder.parentId);
      }
  }

  setSelectedFile(file: FileItem | FolderItem | null) {
      this._selectedFile.next(file);
  }

  requestExpandFolder(folderId: number) {
      this._expandFolderRequest.next(folderId);
  }

  uploadFile(file: File, parentId: number | null): Observable<boolean> {
    const newFile: FileItem = {
      id: Math.floor(Math.random() * 10000),
      parentId: parentId,
      name: file.name,
      type: this.getTypeFromFile(file),
      size: file.size,
      modified: new Date(),
      ownerId: 1, // Mock user ID
      permissions: { type: 'nobody_else' }
    };

    const currentFiles = this._files.getValue();
    this._files.next([...currentFiles, newFile]);
    return of(true);
  }

  createFolder(name: string, parentId: number | null): Observable<boolean> {
      const newFolder: FolderItem = {
          id: Math.floor(Math.random() * 10000),
          parentId: parentId,
          name: name,
          type: 'folder',
          size: 0,
          modified: new Date(),
          ownerId: 1,
          permissions: { type: 'nobody_else' },
          expanded: false
      };
      const currentFiles = this._files.getValue();
      this._files.next([...currentFiles, newFolder]);
      return of(true);
  }

  deleteFile(id: number): Observable<boolean> {
    const currentFiles = this._files.getValue();
    this._files.next(currentFiles.filter(f => f.id !== id));
    return of(true);
  }

  renameFile(id: number, newName: string): Observable<boolean> {
    const currentFiles = this._files.getValue();
    const index = currentFiles.findIndex(f => f.id === id);
    if (index !== -1) {
      const updatedFiles = [...currentFiles];
      updatedFiles[index] = { ...updatedFiles[index], name: newName };
      this._files.next(updatedFiles);
      return of(true);
    }
    return of(false);
  }

  private getTypeFromFile(file: File): FileType {
    if (file.type.startsWith('image')) return 'image';
    if (file.type.startsWith('video')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'unknown';
  }
}
