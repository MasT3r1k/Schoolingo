import { Component, OnInit } from '@angular/core';
import { Mark, Schoolingo } from '@Schoolingo';
import { Subscription } from 'rxjs';

@Component({
  host: {'module': 'Interm'},
  standalone: true,
  imports: [],
  templateUrl: './Interm.html',
  styleUrls: ['./Interm.css', '../Modules.css']
})
export class IntermComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  private listeners: Subscription[] = [];

  ngOnInit(): void {}

  public sortMarks(): typeof this.schoolingo.marks {
    return this.schoolingo.marks.sort((a: any, b: any) => a.created - b.created).slice(0, 5);
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
