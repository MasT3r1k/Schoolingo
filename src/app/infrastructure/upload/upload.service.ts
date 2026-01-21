import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private http = inject(HttpClient);
    
    /**
     * Upload a single file
     * @param file The file to upload
     */
    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        // TODO: Replace with actual API endpoint once available
        // return this.http.post<{ url: string }>(`${Config.API_URL}/v1/upload`, formData, {
        //   withCredentials: true
        // });

        // Mock response for now
        return of({ url: URL.createObjectURL(file) });
    }
}
