import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Config } from "@Schoolingo/config";
import { permType } from "@Schoolingo/permission";
import { BehaviorSubject } from "rxjs";

export type FileType = 'folder' | 'file';

export interface FileItem {
    document_id: number | null;
    parent_id: number | null; // null for root
    file_id: number | null;
    file_uuid: string | null;
    name: string | null; // null for all files folder
    file_format: string | null;
    mime_type: string;
    type: FileType;
    file_size: number;
    permissions: permType[];
    owner_id: number | null;
    content?: string;
    can_manage_permissions: boolean;
    modified_at: Date;
    created_at: Date;
}

export interface FolderItem extends FileItem {
    type: 'folder';
    files_count: number;
    expanded?: boolean;
}

export interface DocumentPermission {
    document_permission_id?: number;
    role_id: number | null;
    role_name?: string;
    user_id: number | null;
    username?: string;
    first_name?: string;
    last_name?: string;
    permission_type: 'READ' | 'WRITE' | 'DENY';
}

export class Documents {
    private http = inject(HttpClient)
    private sanitizer = inject(DomSanitizer);
    private _files = new BehaviorSubject<(FileItem | FolderItem)[]>([]);
    public files$ = this._files.asObservable();
    private _current_folder = new BehaviorSubject<FolderItem | null>(null);
    public currentFolder$ = this._current_folder.asObservable();
    private _selected_file = new BehaviorSubject<FileItem | FolderItem | null>(null);
    public selectedFile$ = this._selected_file.asObservable();
    private _opened_file = new BehaviorSubject<FileItem | null>(null);
    public openedFile$ = this._opened_file.asObservable();
    public isRefreshing$ = new BehaviorSubject<boolean>(false);

    public declare preview_url: SafeUrl;
    public fileData: any = null;

    ///

    public renamingFile: FileItem | FolderItem | null = null;

    public selectFolder(folder: FileItem | FolderItem | null, select_file: FileItem | FolderItem | number | null = null): void {
        this._opened_file.next(null);
        if (folder !== null && folder.type !== 'folder') {
            this.openFile(folder);
            return;
        }

        if (folder !== null && folder.type === 'folder') {
            this.loadFiles(folder.document_id);
        } else if (folder === null) {
            this.loadFiles(null);
        }
        
        this._current_folder.next(folder as FolderItem | null);
        if (select_file instanceof Number) {
            this._selected_file.next(this._files.getValue()[0]);
        } else {
            this._selected_file.next(select_file as FolderItem | FileItem | null);
        }
    }

    public getSelectedFolder(): FolderItem | null {
        return this._current_folder.getValue();
    }

    public getSelectedFile(): FileItem | FolderItem | null {
        return this._selected_file.getValue();
    }

    public getOpenedFile(): FileItem | null {
        return this._opened_file.getValue();
    }

    public openFile(item: FileItem | null): void {
        this._selected_file.next(null);
        this._opened_file.next(item);
        if (item == null) {
            this.fileData = null;
            return;
        }
        this.http.get(
            `${Config.API_URL}/file_info/${item.file_uuid}`,
            { withCredentials: true }
        )
        .subscribe((data) => {
            this.fileData = data;
            const file = this.getOpenedFile();
            if (!file) return;
            if (['.docx', '.doc', '.pptx'].includes(file.file_format!)) {
                this.preview_url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${Config.API_URL}/file/${file.file_uuid}?access_token=${this.fileData?.access_token ?? ''}`)
            } else if (['.pdf'].includes(file.file_format!)) {
                this.preview_url = this.sanitizer.bypassSecurityTrustResourceUrl(
                    `${Config.API_URL}/file/${file.file_uuid}#toolbar=0&navpanes=0`
                )
            }
        })
    }

    public renameFile(file_id: number, name: string): void {
        this.http.post(
            `${Config.API_URL}/v1/documents/rename_file`,
            { file_id, name },
            { withCredentials: true }
        )
        .subscribe(
            (data) => console.log(data),
            (err) => console.error(err)
        )
    }

    public downloadFile(file: FileItem) {
        this.http.get(
            `${Config.API_URL}/download/${file.file_uuid}`,
            {
            withCredentials: true,
            responseType: 'blob'
            }
        ).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = file.name ?? 'Schoolingo'; // název souboru
            a.click();

            window.URL.revokeObjectURL(url);
        });
    }

    public getPermissions(document_id: number) {
        return this.http.post<DocumentPermission[]>(
            `${Config.API_URL}/v1/documents/get_permissions`,
            { document_id },
            { withCredentials: true }
        );
    }

    public setPermissions(document_id: number, permissions: DocumentPermission[]) {
        return this.http.post<{ success: boolean }>(
            `${Config.API_URL}/v1/documents/set_permissions`,
            { document_id, permissions },
            { withCredentials: true }
        );
    }

    public getPermissionOptions() {
        return this.http.get<{ roles: any[], users: any[] }>(
            `${Config.API_URL}/v1/documents/permission_options`,
            { withCredentials: true }
        );
    }

    public loadFiles(parent_id: number | null): void {
        this.isRefreshing$.next(true);
        this.http.post<(FileItem | FolderItem)[]>(
            `${Config.API_URL}/v1/documents/files`,
            { parent_id },
            { withCredentials: true }
        )
        .subscribe(
            (files: (FileItem | FolderItem)[]) => {
                const currentFiles = this._files.getValue();
                const otherFiles = currentFiles.filter(f => f.parent_id !== parent_id || f.document_id === null);
                this._files.next([...otherFiles, ...files]);
                setTimeout(() => this.isRefreshing$.next(false), 800);
            },
            (error) => {
                this.isRefreshing$.next(false);
            }
        );
    }

    public getFile(file_id: number | null): FileItem | FolderItem {
        return this._files.getValue().find((file) => file.document_id == file_id)!;
    }

    public addFile(file: FileItem | FolderItem): void {
        const files = this._files.getValue();

        const existsIndex = files.findIndex(f => f.document_id === file.document_id && file.document_id !== null);
        if (existsIndex !== -1) {
            files[existsIndex] = file;
            this._files.next([...files]);
            return;
        }

        this._files.next([...files, file]);
    }

    public getFiles(search: string = '') {
        return this._files.getValue()
            .filter((file) => file.name?.toLowerCase()?.match(search.toLowerCase()))
            .filter((file) => file.parent_id === (this._current_folder.getValue()?.document_id ?? null))
            .sort((a, b) => {
                // Nejdřív seřadíme složky
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;

                // Jinak seřadit podle názvu
                return a.name!.localeCompare(b.name!);
            });
    }

    public getIcon(type: string): string {
        if (type.includes('pdf')) return 'file-type-pdf';
        if (type.includes('sheet') || type.includes('excel') || type.includes('ms-excel')) return 'table';
        if (type.includes('word') || type.includes('officedocument.wordprocessingml')) return 'file-text';
        if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
        
        switch (type.split('/')[0]) {
            case 'folder': return 'folder-filled';
            case 'image': return 'photo';
            case 'video': return 'movie';
            default: return 'file';
        }
    }

    public showProperties(file: FileItem | FolderItem): void {
        this._selected_file.next(file);
    }

    public closeProperties(): void {
        this._selected_file.next(null);
    }

    public getTree() {
        const files = this._files.value;

        // Přidáme children property
        const map = new Map<number | null, any>();
        files.forEach(f => map.set(f.document_id, { ...f, children: [] }));

        let root: any[] = [];

        files.forEach(f => {
            const node = map.get(f.document_id);

            if (f.parent_id === -1) {
                root.push(node);
            } else {
                const parent = map.get(f.parent_id);
                if (parent) {
                    parent.children.push(node);
                }
            }
        });

        // Rekurzivní seřazení: nejdřív složky, pak soubory
        const sortTree = (nodes: any[]) => {
            nodes.sort((a, b) => {
                // složky nahoru
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;

                // pokud jsou oba stejné, řadit podle názvu
                return a.name.localeCompare(b.name);
            });

            // rekurze
            nodes.forEach(n => sortTree(n.children));
        };

        sortTree(root);

        return root;
    }



    constructor() {
        const defaultFolder: (FileItem | FolderItem)[] = [
            {
                document_id: null,
                file_id: null,
                file_uuid: null,
                file_format: null,
                mime_type: '',
                parent_id: -1,
                name: null,
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: null,
                permissions: [],
                files_count: 0,
                can_manage_permissions: true,
                file_size: 0
            }
        ]
        this._files.next(defaultFolder);
    }
}