import { Subscription } from 'rxjs';

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  serverId?: string;
  subscription?: Subscription; 
}

export * from './upload.service';

