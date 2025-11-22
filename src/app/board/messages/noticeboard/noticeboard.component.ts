import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

interface Announcement {
  id: number;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  date: Date;
  attachments?: { name: string; type: string }[];
  likes: number;
  comments: number;
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

  ngOnInit(): void {
    this.announcements = [
      {
        id: 1,
        author: { name: 'Mgr. Jana Nováková', role: 'teacher' },
        content: 'Vážení studenti, připomínám zítřejší termín odevzdání seminárních prací. Prosím nahrajte je do systému do 23:59.',
        date: new Date(),
        likes: 12,
        comments: 3
      },
      {
        id: 2,
        author: { name: 'Ředitelství školy', role: 'director' },
        content: 'Z důvodu havárie vody bude zítra 24.11. zkrácené vyučování. Konec výuky ve 12:35.',
        date: new Date(Date.now() - 86400000),
        attachments: [{ name: 'rozhodnuti_reditele.pdf', type: 'pdf' }],
        likes: 45,
        comments: 0
      },
      {
        id: 3,
        author: { name: 'Školní parlament', role: 'student' },
        content: 'Vánoční jarmark se blíží! Přijďte nás podpořit a nakoupit drobné dárky. Výtěžek půjde na charitu.',
        date: new Date(Date.now() - 172800000),
        attachments: [{ name: 'plakat.jpg', type: 'image' }],
        likes: 89,
        comments: 15
      }
    ];
  }

  public getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
