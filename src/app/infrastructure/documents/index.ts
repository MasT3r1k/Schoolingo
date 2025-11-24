import { permType } from "@Schoolingo/permission";
import { BehaviorSubject } from "rxjs";

export type FileType = 'folder' | 'image' | 'video' | 'pdf' | 'doc' | 'sheet' | 'unknown';

export interface FileItem {
    file_id: number | null;
    parent_id: number | null; // null for root
    name: string;
    type:  FileType;
    size: number;
    permissions: permType[];
    owner_id: number | null;
    content?: string;
    modified_at: Date;
    created_at: Date;
}

export interface FolderItem extends FileItem {
    type: 'folder';
    expanded?: boolean;
}

export class Documents {
    private _files = new BehaviorSubject<(FileItem | FolderItem)[]>([]);
    public files$ = this._files.asObservable();
    private _current_folder = new BehaviorSubject<FolderItem | null>(null);
    public currentFolder$ = this._current_folder.asObservable();
    private _selected_file = new BehaviorSubject<FileItem | FolderItem | null>(null);
    public selectedFile$ = this._selected_file.asObservable();

    public selectFolder(folder: FileItem | FolderItem | null): void {
        if (folder?.type !== 'folder') return;
        this._current_folder.next(folder as FolderItem);
        this._selected_file.next(null);
    }

    public getSelectedFile(): FileItem | FolderItem | null {
        return this._selected_file.getValue();
    }

    public getFiles() {
        return this._files.getValue().filter((file) => file.parent_id == this._current_folder.getValue()?.file_id || null);
    }

    public getIcon(type: string): string {
        switch (type) {
        case 'folder': return 'folder-filled';
        case 'image': return 'photo';
        case 'video': return 'movie';
        case 'pdf': return 'file-type-pdf';
        case 'sheet': return 'table';
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
        files.forEach(f => map.set(f.file_id, { ...f, children: [] }));

        let root: any[] = [];

        files.forEach(f => {
            const node = map.get(f.file_id);

            if (f.parent_id === -1) {
                // Root položka (Všechny soubory)
                root.push(node);
            } else {
                const parent = map.get(f.parent_id);
                if (parent) {
                    parent.children.push(node);
                }
            }
        });

        return root;
    }


    constructor() {
        const mockData: (FileItem | FolderItem)[] = [
            {
                file_id: null,
                parent_id: -1,
                name: 'Všechny soubory',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: null,
                permissions: [],
                size: 0
            },
            {
                file_id: 1,
                parent_id: null,
                name: 'Dokumenty školy',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 0
            },
            {
                file_id: 2,
                parent_id: null,
                name: 'Fotogalerie',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 0
            },
            {
                file_id: 3,
                parent_id: 1,
                name: 'Řád školy.pdf',
                type: 'pdf',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 500 // 500KB
            },
            {
                file_id: 4,
                parent_id: 1,
                name: 'Rozvrh 2024.xlsx',
                type: 'sheet',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 20 // 20kb
            },
            {
                file_id: 5,
                parent_id: 2,
                name: 'Výlet 2023.jpg',
                type: 'image',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 2500
            },
            {
                file_id: 6,
                parent_id: null,
                name: 'Dokumenty školy',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 0
            },
            {
                file_id: 7,
                parent_id: null,
                name: 'Fotogalerie',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 0
            },
            {
                file_id: 8,
                parent_id: 1,
                name: 'Řád školy.pdf',
                type: 'pdf',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 500 // 500KB
            },
            {
                file_id: 9,
                parent_id: 1,
                name: 'Rozvrh 2024.xlsx',
                type: 'sheet',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 20 // 20kb
            },
            {
                file_id: 10,
                parent_id: 2,
                name: 'Výlet 2023.jpg',
                type: 'image',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 2500
            },
            {
                file_id: 11,
                parent_id: null,
                name: 'Dokumenty školy',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 0
            },
            {
                file_id: 12,
                parent_id: null,
                name: 'Fotogalerie',
                type: 'folder',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 0
            },
            {
                file_id: 13,
                parent_id: 1,
                name: 'Řád školy.pdf',
                type: 'pdf',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 500 // 500KB
            },
            {
                file_id: 14,
                parent_id: 1,
                name: 'Rozvrh 2024.xlsx',
                type: 'sheet',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 20 // 20kb
            },
            {
                file_id: 15,
                parent_id: 2,
                name: 'Výlet 2023.jpg',
                type: 'image',
                modified_at: new Date(),
                created_at: new Date(),
                owner_id: 1,
                permissions: [],
                size: 1024 * 2500
            }
        ];
        this._files.next(mockData);
    }
}