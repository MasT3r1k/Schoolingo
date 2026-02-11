import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Documents } from '@Schoolingo/documents';
import { DropdownManager } from '@Schoolingo/dropdown';

interface FileItem {
  file_id: string;
  file_uuid: string;
  real_file_name: string;
  name: string;
  origin: string;
  file_size: number;
  storage_path: string;
  mime_type: string;
  created_at: Date;
  owner: string;
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
            `${Config.API_URL}/v1/files?limit=${this.pageSize}&offset=${this.pageSize * (this.currentPage - 1)}`,
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
            this.files = this.files.filter(f => f.file_id !== file.file_id);
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

    formatBytes = Utils.formatBytes;
    formatDate = Utils.formatDate;
}
