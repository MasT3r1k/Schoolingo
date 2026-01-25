import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '@Schoolingo/config';
import { MessageManager } from '@Schoolingo/messages';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private http = inject(HttpClient);
    private messageManager = inject(MessageManager);    

    /**
     * Upload a single file
     * @param files The files to upload
     */

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

    uploadFiles(files: any, origin: string | null = null): Observable<any> {
        const MAX_MB = this.messageManager.getConfig().file_max_size_in_mb;
        const formData = new FormData();
        if (origin) {
            formData.append('origin', origin);
        }

        for(const file of files) {
            formData.append('files', file)
        }

        return this.http.post<any>(
            `${Config.API_URL}/upload`,
            formData,
            {
                reportProgress: true,
                observe: 'events',
                withCredentials: true,
            } as any
        );
    }

    public removeFile(fileId: string): void {
        this.http.delete(
            `${Config.API_URL}/delete_file/${fileId}`,
            { withCredentials: true }
        )
        .subscribe();
    }
}
