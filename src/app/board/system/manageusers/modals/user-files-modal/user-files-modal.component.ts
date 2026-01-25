import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { User } from '../../manageusers.component';

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  isFolder: boolean;
  createdAt: Date;
  uploadedBy: string;
}

@Component({
  selector: 'app-user-files-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './user-files-modal.component.html',
  styleUrl: './user-files-modal.component.css'
})
export class UserFilesModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() closeModal = new EventEmitter<void>();

  // Mock Data
  storageLimit = 1073741824; // 1 GB
  storageUsage = 0;
  usagePercentage = 0;
  totalFiles = 0;
  totalFolders = 0;

  files: FileItem[] = [];
  currentPath = '/';
  searchQuery = '';
  isLoading = false;

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.files = this.generateMockFiles();
      this.calculateStats();
      this.isLoading = false;
    }, 600);
  }

  generateMockFiles(): FileItem[] {
    return [
      {
        id: '1',
        name: 'Dokumenty',
        path: '/Dokumenty',
        size: 0,
        type: 'folder',
        isFolder: true,
        createdAt: new Date('2025-01-10T10:00:00'),
        uploadedBy: 'user'
      },
      {
        id: '2',
        name: 'Slovníček.pdf',
        path: '/',
        size: 2500000, // 2.5 MB
        type: 'pdf',
        isFolder: false,
        createdAt: new Date('2025-01-15T14:30:00'),
        uploadedBy: 'user'
      },
      {
        id: '3',
        name: 'Prezentace.pptx',
        path: '/',
        size: 15000000, // 15 MB
        type: 'pptx',
        isFolder: false,
        createdAt: new Date('2025-01-20T09:15:00'),
        uploadedBy: 'user'
      },
      {
        id: '4',
        name: 'Projekt_v2.zip',
        path: '/',
        size: 150000000, // 150 MB
        type: 'zip',
        isFolder: false,
        createdAt: new Date('2025-01-22T16:45:00'),
        uploadedBy: 'user'
      },
      {
        id: '5',
        name: 'screenshot_error.png',
        path: '/',
        size: 450000, // 450 KB
        type: 'image',
        isFolder: false,
        createdAt: new Date('2025-01-23T11:20:00'),
        uploadedBy: 'user'
      }
    ];
  }

  calculateStats() {
    this.storageUsage = this.files.reduce((acc, file) => acc + file.size, 0);
    this.usagePercentage = (this.storageUsage / this.storageLimit) * 100;
    this.totalFiles = this.files.filter(f => !f.isFolder).length;
    this.totalFolders = this.files.filter(f => f.isFolder).length;
  }

  close() {
    this.closeModal.emit();
  }

  resetQuota() {
    if (confirm('Opravdu chcete resetovat kvótu tomuto uživateli?')) {
        this.storageUsage = 0;
        this.usagePercentage = 0;
        // Call API
    }
  }

  navigate(path: string) {
    this.currentPath = path;
    // Reload files for path
  }

  onSearch() {
    // Client side filter or API call
  }

  // Actions
  deleteFile(file: FileItem) {
    if (confirm(`Opravdu smazat ${file.name}?`)) {
        this.files = this.files.filter(f => f.id !== file.id);
        this.calculateStats();
    }
  }

  downloadFile(file: FileItem) {
    console.log('Downloading', file.name);
  }

  shareFile(file: FileItem) {
    alert(`Odkaz pro sdílení: https://schoolingo.cz/share/${file.id}`);
  }

  generateCode(file: FileItem) {
    const code = Math.floor(100000 + Math.random() * 900000);
    alert(`Přístupový kód pro ${file.name}: ${code}`);
  }

  viewFile(file: FileItem) {
    console.log('Viewing content of', file.name);
  }

  // Helpers
  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleString('cs-CZ');
  }

  getFileIcon(file: FileItem): string {
    if (file.isFolder) return 'folder';
    if (file.type === 'image') return 'photo';
    if (file.type === 'pdf') return 'file-text';
    if (file.type === 'zip') return 'file-zip';
    if (file.type === 'code') return 'code';
    return 'file';
  }

  getFileIconClass(file: FileItem): string {
    if (file.isFolder) return 'folder';
    if (file.type === 'image') return 'image';
    if (file.type === 'pdf') return 'pdf';
    return '';
  }
}
