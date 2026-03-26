import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { EducationMeasuresService, MeasureTypeItem } from '../../../../../infrastructure/measures/education-measures.service';

@Component({
  selector: 'app-add-measure-type',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './add-measure-type.component.html',
  styleUrl: './add-measure-type.component.css'
})
export class AddMeasureTypeComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  private measuresService = inject(EducationMeasuresService);

  public data: any;
  public newType: Omit<MeasureTypeItem, 'id'> = {
    shortcut: '',
    label_1st: '',
    label_4th: '',
    order: 0
  };

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('add_measure_type');
    if (this.data?.type) {
        this.newType = { ...this.data.type };
    }
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_measure_type');
  }

  public saveType(): void {
    if (this.newType.shortcut && this.newType.label_1st) {
        const obs = this.data?.editMode && (this.newType as any).id
            ? this.measuresService.updateMeasureType((this.newType as any).id, this.newType)
            : this.measuresService.saveMeasureType(this.newType);

        obs.subscribe(() => {
            if (this.data.callback) {
                this.data.callback();
            }
            this.closeModal();
        });
    }
  }
}
