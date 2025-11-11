import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';
import { Alert } from '../../../../../infrastructure/alert/alert';
import { MarksManager } from '@Schoolingo/marks';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ModalManager } from '@Schoolingo/modal';
import { ActivatedRoute } from '@angular/router';
import { Utils } from '@Schoolingo/utils';
import { ContextMenu } from '@Schoolingo/context-menu';

interface MarkingScale {
  ms_id: number;
  name: string | null;
  is_default: boolean;
  grades: [number, number, number, number, number];
  most_used_subject: {
    subject_id: number;
    subject_name: string;
    count: number;
  }
  usage_count: number;
  last_updated: Date;
}

interface CreateMarkingScaleAPI {
  status: boolean,
  marking_scale: {
    ms_id: number,
    name: string,
    grades: [number, number, number, number, number],
    is_default: boolean,
    last_updated: Date
  }
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IconsModule, NgStyle],
  templateUrl: './edit-marking-scale.component.html',
  styleUrls: ['./edit-marking-scale.component.css', '../../../../../Components/modal/modal.css']
})
export class EditMarkingScaleComponent implements OnInit {
  public l = inject(Locale)
  private modalManager = inject(ModalManager);
  public marksManager = inject(MarksManager);
  private context_menu = inject(ContextMenu);
  private http = inject(HttpClient);
  public alert: string | null = null;
  private route = inject(ActivatedRoute);
  public Utils = Utils;

  public page: 'detail' | 'list' | 'edit' | 'new' = 'detail'; 
  public isLoading = true;
  public loadingList = 5;
  public name: string | null = null;
  public grades: number[] = [];
  public selected_marking_scale?: MarkingScale
  public marking_scales: MarkingScale[] = [];
  public ordered_marking_scales: MarkingScale[] = this.getMarkingScales();
  public errors: { [key: string]: string } = {};


  ngOnInit(): void {
    const subject_id = this.route.snapshot.queryParamMap.get('subject_id');
    const group_id = this.route.snapshot.queryParamMap.get('group_id');

    this.http.get<MarkingScale>(
      `${Config.API_URL}/v1/marks/teacher/marking_scale?subject_id=${subject_id}&group_id=${group_id}`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('error' in data) {
        return;
      }
      this.isLoading = false;
      this.selected_marking_scale = data;
    });
  }

  public contextMenuEditMarkingScale(ms_id: number, event: MouseEvent): void {
    event.preventDefault();
    let items: any[] = [
      { text: 'marks.edit_marking_scale.edit_table', action: () => {
        this.context_menu.hideContextMenu();
        const markingScaleIndex = this.marking_scales.findIndex((markingscale) => markingscale.ms_id == ms_id);
        this.editMarkingScale(this.marking_scales[markingScaleIndex])
      }
      },
    ]

    if (this.marking_scales.find((ms) => ms.ms_id == ms_id)?.is_default == false) {
      items.push(
        { text: 'delete', color: 'danger', action: () => { this.context_menu.hideContextMenu();this.deleteMarkingScale(ms_id) } },
      )
    }
  
    items.push(
      { type: 'split' },
      { text: 'close', action: () => this.context_menu.hideContextMenu() }
    )

    this.context_menu.setItems(items);
    this.context_menu.showContextMenu(event.x, event.y)
    console.log(ms_id, event);
  }

  public contextMenuChangeMarkingScale(ms_id: number, event: MouseEvent): void {
    event.preventDefault();

    this.context_menu.setItems([
      { text: 'marks.edit_marking_scale.change_table', action: () => {this.context_menu.hideContextMenu();this.go_to_list()} },
      { type: 'split' },
      { text: 'close', action: () => this.context_menu.hideContextMenu() }
    ]);
    this.context_menu.showContextMenu(event.x, event.y)
  }

  public go_to_list(): void {
    this.page = 'list';

    this.http.get<{total: number, marking_scales: MarkingScale[]}>(
      `${Config.API_URL}/v1/marks/teacher/marking_scales`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      data.marking_scales.forEach((newScale) => {
        const exists = this.marking_scales.some(
          (existing) => existing.ms_id === newScale.ms_id
        );
        if (!exists) {
          this.marking_scales.push(newScale);
        }
      });

      this.ordered_marking_scales = this.getMarkingScales();
      this.loadingList = data.total - this.marking_scales.length;
      console.log(data);
    });
  }

  public getMarkingScale(ms_id: number): MarkingScale | undefined {
    return this.marking_scales.find((marking_scale) => marking_scale.ms_id == ms_id);
  }

  public getMarkingScales(): MarkingScale[] {
    const selected = this.selected_marking_scale;
    const scales = [...this.marking_scales];

    // Pokud vybraný neexistuje v poli, přidej ho
    if (selected && !scales.find(ms => ms.ms_id === selected.ms_id)) {
      scales.unshift(selected);
    }

    // Seřazení podle priorit:
    // 1. vybraný (selected_marking_scale)
    // 2. výchozí (is_default)
    // 3. ostatní podle last_updated (nejnovější první)
    return scales.sort((a, b) => {
      // 1️⃣ Vybraný má prioritu
      if (selected) {
        if (a.ms_id === selected.ms_id) return -1;
        if (b.ms_id === selected.ms_id) return 1;
      }

      // 2️⃣ Výchozí má další prioritu
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;

      // 3️⃣ Ostatní podle času poslední úpravy (nejnovější první)
      return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
    });
  }
  public editMarkingScale(marking_scale: MarkingScale): void {
    console.log(marking_scale)
    this.markingScale = JSON.parse(JSON.stringify(marking_scale));
    this.page = 'edit';
  }

  public isEditing = false;
  public markingScale: MarkingScale = {
    ms_id: -1,
    grades: [90,70,65,45,0],
    name: "",
    is_default: false,
    most_used_subject: {
      subject_id: -1,
      subject_name: "",
      count: 0
    },
    usage_count: 0,
    last_updated: new Date()
  }

  public newMarkingScale: MarkingScale = {
    ms_id: -1,
    grades:[90,70,65,45,0],
    name: "",
    is_default: false,
    most_used_subject: {
      subject_id: -1,
      subject_name: "",
      count: 0
    },
    usage_count: 0,
    last_updated: new Date()
  };

  public cancelEdit(): void {

  }

  // === Save selected marking scale to subject id and group id
  public saveMarkingScale(): void {
    const subject_id = this.route.snapshot.queryParamMap.get('subject_id');
    const group_id = this.route.snapshot.queryParamMap.get('group_id');

    if (!subject_id || !group_id) return;
    if (!this.selected_marking_scale) return;

    this.http.post(
      `${Config.API_URL}/v1/marks/teacher/marking_scale_select`,
      { ms_id: this.selected_marking_scale.ms_id, subject_id: Number(subject_id), group_id: Number(group_id) },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && 'ms_id' in data) {
        this.modalManager.closeModal('edit_marking_scale');
      }
    });
  }

  public selectMarkingScale(marking_scale: MarkingScale): void {
    this.selected_marking_scale = marking_scale;
    this.page = 'detail';
  }

  // === Delete marking scale from system
  public deleteMarkingScale(ms_id: number): void {
    const m_scale = this.marking_scales.find((mscale) => mscale.ms_id == ms_id);
  
    if (!m_scale || m_scale.is_default) return;
    
    this.http.delete(
      `${Config.API_URL}/v1/marks/teacher/marking_scale?ms_id=${ms_id}`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status == true && 'deleted_id' in data) {
        this.marking_scales = this.marking_scales.filter((mscale) => mscale.ms_id != data.deleted_id);
        this.ordered_marking_scales = this.getMarkingScales();
      }
    })
  }

  // === Updating marking scale to database
  public updateMarkingScale(): void {
    this.alert = '';
    if (!this.markingScale) return;
    if (this.markingScale.name && this.markingScale.name.length > 20) {
      this.alert = 'marks.alerts.too_long_name';
      return;
    }

    const g = this.markingScale.grades;
    if (!(g[0] > g[1] && g[1] > g[2] && g[2] > g[3] && g[3] > g[4])) {
      this.alert = 'marks.alerts.invalid_grades';
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/marks/teacher/marking_scale`,
      {
        ms_id: this.markingScale.ms_id,
        name: this.markingScale.name ?? null,
        grades: this.markingScale.grades.map((grade) => parseFloat(grade.toString()))
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data) {
        if (data.status == true && 'ms_id' in data && 'name' in data && 'grades' in data && 'updated_at' in data) {
          let m_scale_index = this.marking_scales.findIndex((markingscale) => markingscale.ms_id == data.ms_id);
          if (m_scale_index == -1) return;
          this.marking_scales[m_scale_index].name = data.name as string;
          this.marking_scales[m_scale_index].grades = data.grades as [number, number, number, number, number];
          this.marking_scales[m_scale_index].last_updated = data.updated_at as Date;

          // Check if selected_marking_scale is changed
          if (this.selected_marking_scale && this.selected_marking_scale?.ms_id == data.ms_id) {
            this.selected_marking_scale = this.marking_scales[m_scale_index];
          }

          this.ordered_marking_scales = this.getMarkingScales();
          this.page = 'list';
        }
      }
      console.log(data)
    })
  }

  public createMarkingScale(): void {
    if (!this.newMarkingScale) return;

    const g = this.newMarkingScale.grades;
    if (!(g[0] > g[1] && g[1] > g[2] && g[2] > g[3] && g[3] > g[4])) {
      this.alert = 'marks.alerts.invalid_grades';
      return;
    }

    this.http.post<CreateMarkingScaleAPI>(
      `${Config.API_URL}/v1/marks/teacher/marking_scale_create`,
      {
        name: this.newMarkingScale.name ?? null,
        grades: this.newMarkingScale.grades.map((grade) => parseFloat(grade.toString()))
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data) {
        if (data.status == true && 'marking_scale' in data) {
          const m_scale: MarkingScale = {
            ...data.marking_scale,
            most_used_subject: {
              subject_id: -1,
              subject_name: '',
              count: 0
            },
            usage_count: 0
          }
          this.marking_scales.push(m_scale);
          this.ordered_marking_scales = this.getMarkingScales();
          this.page = 'list';
          this.newMarkingScale = {
            ms_id: -1,
            grades:[90,70,65,45,0],
            name: "",
            is_default: false,
            most_used_subject: {
              subject_id: -1,
              subject_name: "",
              count: 0
            },
            usage_count: 0,
            last_updated: new Date()
          };
        }

      }
      console.log(data)
    })

  }

  public addGrade(): void {

  }
}
