import { Component, OnInit } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

@Component({
  host: {'module': 'Announcements'},
  standalone: true,
  imports: [],
  templateUrl: './Announcements.html',
  styleUrls: ['./Announcements.css', '../Modules.css']
})
export class AnnouncementsComponent implements OnInit {

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
  }
}
