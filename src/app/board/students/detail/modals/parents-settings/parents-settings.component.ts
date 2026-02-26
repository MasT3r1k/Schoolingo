import { Component, inject, OnInit } from '@angular/core';
import { ModalManager } from '@Schoolingo/modal';
import { ParentInfo } from '../../../students.component';
import { IconsModule } from '@Schoolingo/icons';
import { RemoveParentComponent } from '../remove-parent/remove-parent.component';
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

    this.modalManager.addModal('remove_parent', {
      title: 'students.remove_parent.title',
      closeable: true,
      index: 502,
      items: [
        { type: 'component', component: RemoveParentComponent }
      ]
    });
    console.log(this.parents);
  }

  removeParent(parent_id: number): void {
    const parent = this.parents.find((parent) => parent.id == parent_id);
    if (!parent) return;
    this.modalManager.openModal('remove_parent', { parent_id, parent });
  }
}
