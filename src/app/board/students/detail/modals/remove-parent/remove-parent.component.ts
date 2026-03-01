import { Component, inject, OnInit } from '@angular/core';
import { ModalManager } from '@Schoolingo/modal';
import { ParentInfo } from '../../../students.component';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-remove-parent',
  imports: [IconsModule],
  templateUrl: './remove-parent.component.html',
  styleUrl: './remove-parent.component.css'
})
export class RemoveParentComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  public parents: ParentInfo[] = [];
  public student: any = {};
  public selected_option = 0;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('remove_parent');
    this.parents = data.parents;
    this.student = data.student;
    console.log(data);
  }

  public getActionIcon(): string {
        switch(this.selected_option) {
      case 0:
        return 'link-off';
      case 1:
        return 'users-minus';
      case 2:
        return 'trash';
    }
    return ''
  }

  public getActionText(): string {
    switch(this.selected_option) {
      case 0:
        return this.l.s('students.remove_parent.remove_student');
      case 1:
        return this.l.s('students.remove_parent.remove_all_students');
      case 2:
        return this.l.s('students.remove_parent.delete_person');
    }
    return this.l.s('buttons.remove')
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove_parent')
  }
}
