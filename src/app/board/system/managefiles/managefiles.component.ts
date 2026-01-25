import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: Date;
  owner: string;
  ownerId: number;
}

@Component({
  selector: 'app-managefiles',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './managefiles.component.html',
  styleUrl: './managefiles.component.css'
})
export class ManagefilesComponent implements OnInit {
  Math = Math;

  // Mock State
  isLoading = false;
  files: FileItem[] = [];
  
  // Stats
  totalStats = {
      usedSpace: 0,
      usagePercent: 0,
      filesCount: 0,
      usersCount: 0
  };

  // Pagination & Filtering
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  filters = {
      search: '',
      type: 'all'
  };

  ngOnInit() {
      this.loadFiles();
      this.loadStats();
  }

  loadStats() {
      // Mock stats
      this.totalStats = {
          usedSpace: 3450000000, // ~3.4 GB
          usagePercent: 45,
          filesCount: 1243,
          usersCount: 89
      };
  }

  loadFiles(page = 1) {
      this.currentPage = page;
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
          this.generateMockFiles();
          this.isLoading = false;
      }, 600);
  }

  generateMockFiles() {
      const mockFiles: FileItem[] = [];
      const types = ['image', 'pdf', 'document', 'archive', 'code'];
      const owners = ['jnovak', 'admin', 'ucitel1', 'student123', 'reditel'];

      for (let i = 0; i < this.pageSize; i++) {
          const type = types[Math.floor(Math.random() * types.length)];
          const owner = owners[Math.floor(Math.random() * owners.length)];
          
          mockFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              name: `Soubor_${i + (this.currentPage - 1) * this.pageSize}.${this.getExt(type)}`,
              path: `/users/${owner}/uploads/`,
              size: Math.floor(Math.random() * 10000000), // Random size up to 10MB
              type: type,
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
              owner: owner,
              ownerId: 1
          });
      }

      this.files = mockFiles;
      this.totalItems = 245; // Mock total
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  getExt(type: string) {
      switch(type) {
          case 'image': return 'png';
          case 'pdf': return 'pdf';
          case 'document': return 'docx';
          case 'archive': return 'zip';
          case 'code': return 'py';
          default: return 'dat';
      }
  }

  // Actions
  onFilterChange() {
      this.loadFiles(1);
  }

  deleteFile(file: FileItem) {
      if(confirm(`Opravdu smazat ${file.name}?`)) {
          this.files = this.files.filter(f => f.id !== file.id);
          // TODO: API call
      }
  }

  viewFile(file: FileItem) {
      console.log('Viewing', file.name);
  }

  downloadFile(file: FileItem) {
      console.log('Downloading', file.name);
  }

  // Helpers
  getPageList(): number[] {
      const list = [];
      for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
          list.push(i);
      }
      return list;
  }

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
      switch (file.type) {
          case 'image': return 'photo';
          case 'pdf': return 'file-text';
          case 'archive': return 'file-zip';
          case 'code': return 'code';
          default: return 'file';
      }
  }

  getFileIconClass(file: FileItem): string {
      return file.type;
  }
}
