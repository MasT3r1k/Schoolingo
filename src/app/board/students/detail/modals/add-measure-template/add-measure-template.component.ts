import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { EducationMeasuresService } from '../../../../../infrastructure/measures/education-measures.service';

@Component({
  selector: 'app-add-measure-template',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './add-measure-template.component.html',
  styleUrl: './add-measure-template.component.css'
})
export class AddMeasureTemplateComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  private measuresService = inject(EducationMeasuresService);

  public editMode = false;
  public templateId: number | null = null;
  public template = { title: '', content: '' };
  private callback: (() => void) | null = null;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('add_measure_template');
    if (data) {
      this.callback = data.callback;
      if (data.editMode) {
        this.editMode = true;
        this.templateId = data.template.id;
        this.template = { ...data.template };
      }
    }
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_measure_template');
  }

  public saveTemplate(): void {
    if (this.template.title && this.template.content) {
      if (this.editMode && this.templateId !== null) {
        this.measuresService.updateTemplate(this.templateId, this.template).subscribe(() => {
          if (this.callback) this.callback();
          this.closeModal();
        });
      } else {
        this.measuresService.addTemplate(this.template).subscribe(() => {
          if (this.callback) this.callback();
          this.closeModal();
        });
      }
    }
  }
}
