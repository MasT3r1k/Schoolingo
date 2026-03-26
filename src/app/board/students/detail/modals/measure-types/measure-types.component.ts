import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { EducationMeasuresService, MeasureTypeItem } from '../../../../../infrastructure/measures/education-measures.service';
import { ContextMenu } from '@Schoolingo/context-menu';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-measure-types',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './measure-types.component.html',
  styleUrl: './measure-types.component.css'
})
export class MeasureTypesComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public measuresService = inject(EducationMeasuresService);
  public contextMenu = inject(ContextMenu);

  public editingOrderId: number | string | null = null;

  ngOnInit(): void {
    this.measuresService.loadMeasureTypes().subscribe();
  }

  public closeModal(): void {
    this.modalManager.closeModal('measure_types');
  }

  public toggleMenu(event: MouseEvent, type: MeasureTypeItem): void {
    event.stopPropagation();
    this.contextMenu.setItems([
      {
        text: 'buttons.edit',
        action: () => this.editType(type)
      },
      {
        text: 'buttons.duplicate',
        action: () => this.duplicateType(type)
      },
      {
        type: 'split'
      },
      {
        text: 'buttons.remove',
        color: 'danger',
        action: () => this.deleteType(type.id)
      }
    ]);
    this.contextMenu.showContextMenu(event.clientX, event.clientY);
  }


  public openAddModal(): void {
    this.modalManager.updateModal('add_measure_type', 'title', this.l.s('education_measures.types_management.add'));
    this.modalManager.openModal('add_measure_type', {
        callback: () => this.measuresService.loadMeasureTypes().subscribe()
    });
  }

  public editType(type: MeasureTypeItem): void {
    this.modalManager.updateModal('add_measure_type', 'title', this.l.s('education_measures.types_management.edit'));
    this.modalManager.openModal('add_measure_type', {
        editMode: true,
        type: { ...type },
        callback: () => this.measuresService.loadMeasureTypes().subscribe()
    });
  }

  public duplicateType(type: MeasureTypeItem): void {
    this.modalManager.updateModal('add_measure_type', 'title', 'Duplicate measure type'); // Locale missing?
    const duplicatedType = { ...type };
    delete (duplicatedType as any).id;
    this.modalManager.openModal('add_measure_type', {
        type: duplicatedType,
        callback: () => this.measuresService.loadMeasureTypes().subscribe()
    });
  }

  public onOrderEdit(typeId: number | string): void {
    this.editingOrderId = typeId;
  }

  public saveOrder(type: MeasureTypeItem, newOrder: any): void {
    this.editingOrderId = null;
    const orderNum = parseInt(newOrder);
    if (!isNaN(orderNum) && orderNum !== type.order) {
        this.measuresService.updateMeasureType(type.id, { order: orderNum }).subscribe(() => {
            this.measuresService.loadMeasureTypes().subscribe();
        });
    }
  }

  public deleteType(id: number | string): void {
    if (typeof id === 'number') {
        this.measuresService.deleteMeasureType(id).subscribe(() => {
            this.measuresService.loadMeasureTypes().subscribe();
        });
    }
  }

  public reorder(): void {
    // Placeholder for reordering logic
    console.log('Reordering types');
  }
}
