import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
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
  
  public l = inject(Locale);
  public parents: any[] = [];
  public parentForm = [];
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
    const student_id = this.modalManager.getModalData('add_parent').student_id || null;

    this.http.post(
      `${Config.API_URL}/v1/parents/search`,
      {
        limit: 10,
        offset: 0,
        search: this.search.value,
        student_id
      }
    )
    .subscribe((api: any) => {
      this.parents = api.data;
    });
  }

  public addParent(): void {
    const student_id = this.modalManager.getModalData('add_parent').student_id || null;
    const parent_ids = this.parentForm
    .map((_, index) => ({
      parent_id: index,
      role: 'father'
    }))
    .filter((parent) => parent != null);
    console.log(parent_ids)

    this.http.post(
      `${Config.API_URL}/v1/parents/add`,
      {
        student_id,
        parent_ids
      }
    )
    .subscribe((api: any) => {
      if (api.success == true) {
        this.closeModal()
      }
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_parent')
  }

  public openCreateParentModal(): void {
    const data = this.modalManager.getModalData('add_parent');
    this.modalManager.openModal('create_parent', { 
      student_id: data.student_id || null,
      callback: data.callback || null
    });
  }
}
