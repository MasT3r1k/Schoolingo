import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Documents } from '@Schoolingo/documents';
import { AvatarService } from '../../../../infrastructure/utils/avatar.service';

interface FileItem {
  file_id: number;
  file_uuid: string;
  real_file_name: string;
  name: string;
  origin: string;
  file_size: number;
  storage_path: string;
  mime_type: string;
  created_at: Date;
  owner: {
    name: string;
    avatar: string | null;
  };
  owner_id: number;
}

interface StatsAPI {
    files_count: number;
    total_file_size: number;
    unique_owners: number;
    storage_limit: number;
}

@Component({
  selector: 'app-managefiles',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './managefiles.component.html',
  styleUrl: './managefiles.component.css'
})
export class ManagefilesComponent implements OnInit {
    private http = inject(HttpClient);
    public documents = inject(Documents);
    public dropdownManager = inject(DropdownManager);
    public avatarService = inject(AvatarService);
    Utils = Utils;
    Math = Math;

    // Mock State
    isLoading = false;
    files: FileItem[] = [];
    
    // Stats
    totalStats = {
        usedSpace: 0,
        usagePercent: "0",
        filesCount: 0,
        usersCount: 0
    };

    // Pagination & Filtering
    currentPage = 1;
    pageSize = 20;
    totalPages = 0;

    filters = {
        search: '',
        type: 'all'
    };

    public getFilterLabel(type: 'type', value: string): string {
        const options = this.getFilterOptions(type);
        return options.find(o => o.value === value)?.label || value;
    }

    public getFilterOptions(type: 'type'): {value: string, label: string}[] {
        return [
            { value: 'all', label: 'Všechny typy' },
            { value: 'image', label: 'Obrázky' },
            { value: 'document', label: 'Dokumenty' },
            { value: 'archive', label: 'Archivy' },
            { value: 'other', label: 'Ostatní' }
        ];
    }

    ngOnInit() {
        this.loadFiles();
        this.loadStats();
    }

    loadStats() {
        this.http.get<StatsAPI>(
            `${Config.API_URL}/v1/files/stats`,
            { withCredentials: true }
        )
        .subscribe((data) => {
            this.totalStats = {
                filesCount: data.files_count,
                usedSpace: data.total_file_size,
                usersCount: data.unique_owners,
                usagePercent: (Number(data.total_file_size / data.storage_limit) / 100).toFixed(2)
            }

            this.totalPages = this.Math.ceil(data.files_count / this.pageSize);
        });
    }

    loadFiles(page = 1) {
        this.currentPage = page;
        this.isLoading = true;

        this.http.get<FileItem[]>(
            `${Config.API_URL}/v1/files?limit=${this.pageSize}&offset=${this.pageSize * (this.currentPage - 1)}&name=${this.filters.search}&type=${this.filters.type}`,
            { withCredentials: true }
        )
        .subscribe((data) => {
            this.files = data;
        });

        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
        }, 600);
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
            this.http.delete(
                `${Config.API_URL}/v1/files/delete`,
                {
                    body: { file_id: file.file_id },
                    withCredentials: true
                }
            ).subscribe((data: any) => {
                if (data.success) {
                    this.files = this.files.filter(f => f.file_id !== file.file_id);
                    this.loadStats();
                }
            });
        }
    }

    viewFile(file: FileItem) {
        const file_format = file.real_file_name.substring(file.real_file_name.lastIndexOf('.'));
        this.documents.openFile({
            ...file,
            document_id: null,
            parent_id: null,
            file_id: file.file_id,
            name: file.real_file_name,
            file_format: file_format,
            type: 'file',
            permissions: [],
            can_manage_permissions: false,
            modified_at: file.created_at
        } as any);
    }

    downloadFile(file: FileItem) {
        this.documents.downloadFile({
            file_uuid: file.file_uuid,
            name: file.real_file_name
        } as any);
    }

    renameFile(file: FileItem) {
        const newName = prompt('Zadejte nový název souboru:', file.real_file_name);
        if (newName && newName !== file.real_file_name) {
            this.http.post(
                `${Config.API_URL}/v1/files/rename`,
                { file_id: file.file_id, name: newName },
                { withCredentials: true }
            ).subscribe((data: any) => {
                if (data.success) {
                    file.real_file_name = newName;
                }
            });
        }
    }

    // Helpers

    getPageList(): number[] {
        const list = [];
        for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
            list.push(i);
        }
        return list;
    }

    formatBytes = Utils.formatBytes;
    formatDate = Utils.formatDate;
}

