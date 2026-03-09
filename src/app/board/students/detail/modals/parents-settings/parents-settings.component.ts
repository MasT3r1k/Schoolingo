import { Component, inject, OnInit } from '@angular/core';
import { ModalManager } from '@Schoolingo/modal';
import { ParentInfo } from '../../../students.component';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  imports: [IconsModule],
  templateUrl: './parents-settings.component.html',
  styleUrl: './parents-settings.component.css'
})
export class ParentsSettingsComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);

  public parents: ParentInfo[] = [];

  ngOnInit(): void {
    const data = this.modalManager.getModalData('parents_settings');
    this.parents = data.parents;
    console.log(this.parents);
  }

  removeParent(parent_id: number): void {
    const data = this.modalManager.getModalData('parents_settings');
    const parent = this.parents.find((parent) => parent.id == parent_id);
    if (!parent) return;
    this.modalManager.openModal('remove_parent', { student: data.student, parent_id, parent });
  }

  editParent(parent: ParentInfo): void {
    const data = this.modalManager.getModalData('parents_settings');
    this.modalManager.updateModal('create_parent', 'title', 'Upravit zákonného zástupce');
    this.modalManager.updateModal('create_parent', 'icon', 'user-edit');
    this.modalManager.openModal('create_parent', { 
      student_id: data.student_id, 
      mode: 'edit', 
      parent,
      callback: () => {
        if (data.callback) data.callback();
      }
    });
  }
}
