import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { EducationMeasuresService } from '../../../../../infrastructure/measures/education-measures.service';
import { ContextMenu } from '@Schoolingo/context-menu';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';

@Component({
  selector: 'app-measure-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './measure-templates.component.html',
  styleUrl: './measure-templates.component.css'
})
export class MeasureTemplatesComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public measuresService = inject(EducationMeasuresService);
  public contextMenu = inject(ContextMenu);

  public data: any;
  public selectedTemplateId: number | null = null;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('measure_templates');
    this.measuresService.loadTemplates().subscribe();
  }

  public closeModal(): void {
    this.modalManager.closeModal('measure_templates');
  }

  public toggleMenu(event: MouseEvent, template: any): void {
    event.stopPropagation();
    this.contextMenu.setItems([
      {
        text: 'buttons.edit',
        action: () => this.editTemplate(template)
      },
      {
        type: 'split'
      },
      {
        text: 'buttons.remove',
        color: 'danger',
        action: () => this.deleteTemplate(template.id)
      }
    ]);
    this.contextMenu.showContextMenu(event.clientX, event.clientY);
  }


  public selectTemplate(): void {
    const template = this.measuresService.templates().find((t: any) => t.id === this.selectedTemplateId);
    if (template && this.data.callback) {
      this.data.callback(template.content.replaceAll('[date]', Utils.formatDateShort(moment())));
    }
    this.closeModal();
  }

  public openAddModal(): void {
    this.modalManager.updateModal('add_measure_template', 'title', this.l.s('education_measures.templates.add'));
    this.modalManager.openModal('add_measure_template', {
      callback: () => this.measuresService.loadTemplates().subscribe()
    });
  }

  public editTemplate(template: any): void {
    this.modalManager.updateModal('add_measure_template', 'title', this.l.s('education_measures.templates.edit'));
    this.modalManager.openModal('add_measure_template', {
      editMode: true,
      template: { ...template },
      callback: () => this.measuresService.loadTemplates().subscribe()
    });
  }

  public deleteTemplate(id: number): void {
    this.measuresService.deleteTemplate(id).subscribe();
  }
}
