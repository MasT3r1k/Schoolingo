import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Utils } from '@Schoolingo/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-parent.component.html',
  styleUrl: './add-parent.component.css'
})
export class AddParentComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public Utils = Utils;

  public parents: any[] = [];
  public search = new FormControl('');

  ngOnInit(): void {
    this.updateParent();

    this.search.valueChanges
    .pipe(debounceTime(300))
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.updateParent();
    });
  }

  public updateParent(): void {
    this.http.post(
      `${Config.API_URL}/v1/parents/search`,
      {
        limit: 10,
        offset: 0,
        search: this.search.value
      }
    )
    .subscribe((api: any) => {
      this.parents = api.data;
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_parent')
  }
}
