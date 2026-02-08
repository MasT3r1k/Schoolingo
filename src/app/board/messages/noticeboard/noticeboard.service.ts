import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NoticeboardService {
  public selectedMessageId: number | null = null;
}
