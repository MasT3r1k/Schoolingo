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
  public selected_option = 0;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('remove_parent');
    this.parents = data.parents;
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove_parent')
  }
}
