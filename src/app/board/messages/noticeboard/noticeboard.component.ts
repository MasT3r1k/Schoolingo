import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';

interface Announcement {
  id: number;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  headline: string;
  content: string;
  date: Date;
  attachments?: { name: string; type: string }[];
  likes: number;
  comments: number;
  read: boolean;
}

@Component({
  selector: 'app-noticeboard',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './noticeboard.component.html',
  styleUrl: './noticeboard.component.css'
})
export class NoticeboardComponent implements OnInit {
  public l = inject(Locale);
  public announcements: Announcement[] = [];
  Utils = Utils;

  ngOnInit(): void {
    this.announcements = [
      {
        id: 1,
        author: { name: 'Mgr. Jana Nováková', role: 'teacher' },
        headline: 'Seminární práce',
        content: 'Vážení studenti, připomínám zítřejší termín odevzdání seminárních prací. Prosím nahrajte je do systému do 23:59.',
        date: new Date(),
        likes: 12,
        comments: 3,
        read: false
      },
      {
        id: 2,
        author: { name: 'Ředitelství školy', role: 'director' },
        headline: 'Změna výuky',
        content: 'Z důvodu havárie vody bude zítra 24.11. zkrácené vyučování. Konec výuky ve 12:35.',
        date: new Date(Date.now() - 86400000),
        attachments: [{ name: 'rozhodnuti_reditele.pdf', type: 'pdf' }],
        likes: 45,
        comments: 0,
        read: true
      },
      {
        id: 3,
        author: { name: 'Školní parlament', role: 'student' },
        headline: 'Vánoční jarmark',
        content: 'Vánoční jarmark se blíží! Přijďte nás podpořit a nakoupit drobné dárky. Výtěžek půjde na charitu.',
        date: new Date(Date.now() - 172800000),
        attachments: [{ name: 'plakat.jpg', type: 'image' }],
        likes: 89,
        comments: 15,
        read: false
      }
    ];
  }

  public getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
