import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsComponent } from '@Components/Tabs';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MarksManager } from '@Schoolingo/marks';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { BehaviorSubject } from 'rxjs';
import { MarkDetailModalComponent } from '../../../Components/mark-detail-modal/mark-detail-modal.component';

interface StudentIntermAPI {
  status: boolean;
  marks: StudentIntermMarkAPI[];
  subject_stats: Record<number, StudentIntermSubjectStat>;
  mark_stats: Record<number, StudentIntermMarkStat>;
  marking_scales: Record<string, number[]>;
}

interface StudentIntermMarkAPI {
  mark: number;
  column_id: number;
  teacher_id: number;
  teacher_first_name: string;
  teacher_last_name: string;
  teacher_full_name: string;
  created: Date;
  topic: string;
  weight: number;
  max_points: number | null;
  type: number;
  column_index: number;
  subject_id: number;
  subject_name: string;
  group_id: number;
}

interface StudentIntermSubjectStat {
  rank: string;
  total_students: number;
  class_avg: string;
}

interface StudentIntermMarkStat {
  rank: string;
  count: number;
  avg: string;
}

interface PredictorGrade {
  subject_name: string;
  mark: number;
  weight: number;
  topic: string;
  type: number;
  created: Date;
  id: number;
  max_points: number | null;
  isPredicted?: boolean;
}

@Component({
  imports: [TabsComponent, IconsModule, ReactiveFormsModule, FormsModule],
  templateUrl: './interm.component.html',
  styleUrls: ['./interm.component.css']
})
export class IntermComponent implements OnInit {
  // === Tabs ===
  public selectedTab = new BehaviorSubject<number>(0);
  public options = [
    'marks.interm.by_subjects',
    'marks.interm.chronologically',
    'marks.interm.predictor',
  ];

  // === Alert ===
  public alert: '' | 'already_editing_mark' = '';

  // === Data ===
  public marks: StudentIntermMarkAPI[] = [];
  public subjectStats: Record<number, StudentIntermSubjectStat> = {};
  public markStats: Record<number, StudentIntermMarkStat> = {};
  public selectedMark: any | null = null;
  public marksCopy: any[] = [];   // kopie pro prediktor

  // === Predictor ===
  public selected_subject = '';
  public selected_mark = 1;
  public selected_weight = 1;

  /** Prediktor zvlášť pro každý předmět */
  public predictorMap: { [subject: string]: PredictorGrade[] } = {};
  public editingIndex: number | null = null;

  // === Imports ===
  public utils = Utils;
  public l = inject(Locale);
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  public marksManager = inject(MarksManager);
  public dropdownManager = inject(DropdownManager);
  public modalManager = inject(ModalManager);
  public marking_scales: Record<string, number[]> = {};
  public marking_scale: number[] = [85, 70, 50, 30, 0]; // Default fallback

  ngOnInit(): void {
    this.modalManager.addModal('mark_detail', {
      icon: 'number-1',
      title: 'marks.detail_title',
      closeable: true,
      width: 450,
      items: [{ type: 'component', component: MarkDetailModalComponent }]
    });

    this.http
      .post<StudentIntermAPI>(
        `${Config.API_URL}/v1/marks/student`,
        { student_id: this.auth.getId() },
        { withCredentials: true }
      )
      .subscribe((data: StudentIntermAPI) => {
          if ('marks' in data) {
          this.marks = data.marks;
        }
        if ('subject_stats' in data) {
          this.subjectStats = data.subject_stats;
        }
        if ('mark_stats' in data) {
          this.markStats = data.mark_stats;
        }
        if ('marking_scales' in data) {
          this.marking_scales = data.marking_scales;
        }
      });

    this.selectedTab.subscribe((index) => {
      if (index == 2) { if (!this.marksCopy.length) this.loadPredictor() }
    });
  }

  /** Inicializace prediktoru – vytvoření kopie známek */
  public loadPredictor(): void {
    this.alert = '';
    this.marksCopy = JSON.parse(JSON.stringify(this.marks)); // deep copy
    
    for(let i = 0;i < this.marksCopy.length;i++) {
      this.marksCopy[i].id = i;
    }

    if (!this.selected_subject && this.getAllSubjects().length) {
      this.selected_subject = this.getAllSubjects()[0];
    }

    this.predictorMap = {};
    this.editingIndex = null;
    this.selected_mark = 1;
    this.selected_weight = 1;
  }

  /** Uložení úpravy – poznáme podle editingIndex, kam zapisujeme */
  public addMarkToPredictor(): void {
    if (!this.selected_subject) return;

    const newGrade: PredictorGrade = {
      subject_name: this.selected_subject,
      mark: parseFloat(this.selected_mark.toString()),
      weight: parseInt(this.selected_weight.toString()),
      topic: this.l.s('marks.predictor.title'),
      type: 0,
      max_points: null,
      created: new Date(),
      isPredicted: true,
      id: this.getGradesBySubject(this.selected_subject, true).length + (this.predictorMap[this.selected_subject]?.length - 1 || 1)
    };

    // úprava původní známky v kopii
    if (this.editingIndex !== null && this.editingIndex >= 0) {
      this.marksCopy[this.editingIndex] = newGrade;
    }
    // úprava prediktor známky
    else if (this.editingIndex !== null && this.editingIndex < 0) {
      const predIndex = Math.abs(this.editingIndex) - 1;
      this.predictorMap[this.selected_subject][predIndex] = newGrade;
    }
    // přidání nové predikce
    else {
      if (!this.predictorMap[this.selected_subject]) {
        this.predictorMap[this.selected_subject] = [];
      }
      this.predictorMap[this.selected_subject].push(newGrade);
    }

    this.editingIndex = null;
  }

  public editMark(id: number): void {
    const markIndex = this.marksCopy.findIndex((mark: any) => mark.id == id);
    this.editingIndex = id;
    if (markIndex !== -1) {
      const mark = this.marksCopy[markIndex];
      this.selected_subject = mark.subject_name;
      this.selected_mark = mark.mark;
      this.selected_weight = mark.weight;
    } else {
      if (!this.predictorMap[this.selected_subject]) return;
      const markIndex2 = this.predictorMap[this.selected_subject].findIndex((mark: any) => mark.id == id);
      if (markIndex2 === -1) return;
      const mark = this.predictorMap[this.selected_subject][markIndex2];
      this.selected_subject = mark.subject_name;
      this.selected_mark = mark.mark;
      this.selected_weight = mark.weight;
    }
  }

  public updateMark(): void {
    if (this.editingIndex === null) return;
    if (!this.selected_subject) return;

    const markIndex = this.marksCopy.findIndex((mark: any) => mark.id == this.editingIndex);
    if (markIndex !== -1) {
      this.marksCopy[markIndex].mark = parseInt(this.selected_mark.toString());
      this.marksCopy[markIndex].weight = parseInt(this.selected_weight.toString());
    } else {
      if (!this.predictorMap[this.selected_subject]) return;
      const markIndex2 = this.predictorMap[this.selected_subject].findIndex((mark: any) => mark.id == this.editingIndex);
      if (markIndex2 === -1) return;
      this.predictorMap[this.selected_subject][markIndex2].mark = parseInt(this.selected_mark.toString());
      this.predictorMap[this.selected_subject][markIndex2].weight = parseInt(this.selected_weight.toString());
    }

    this.editingIndex = null;
  }

  public removeMark(id: number): void {
    if (this.editingIndex == id) {
      this.alert = 'already_editing_mark';
      return;
    }
    const markIndex = this.marksCopy.findIndex((mark: any) => mark.id === id);
    if (markIndex !== -1) {
      this.marksCopy.splice(markIndex, 1);
    } else {
      if (!this.predictorMap[this.selected_subject]) return;
      this.predictorMap[this.selected_subject] = this.predictorMap[this.selected_subject].filter((mark: any) => mark.id !== id);
    }
  }

  /** Reset prediktoru pro všechny předměty */
  public resetPredictor(): void {
    this.loadPredictor();
  }

  /** Vrátí seznam dostupných předmětů */
  public getAllSubjects(): string[] {
    if (!this.marks) {
      return [];
    }
    const subjectsSet = new Set<string>();
    this.marks.forEach((mark: any) => {
      subjectsSet.add(mark.subject_name);
    });
    return Array.from(subjectsSet);
  }

  /** Všechny známky včetně predikcí */
  public getGradesBySubject(subject: string, addPredicted: boolean = false): any[] {
    const original = this.marksCopy?.filter((mark: any) => mark.subject_name === subject) || [];
    let predicted: any[] = [];
    if (addPredicted) {
      predicted = this.predictorMap[subject] || [];
    }
    return [...original, ...predicted].sort((a, b) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  }

  /** Výpočet průměru i s predikcí */
  public getAverageBySubject(subject: string, addPredicted: boolean = false): string {
    if (!subject) return "";
    const original = this.marks?.filter((mark: any) => mark.subject_name === subject) || [];
    let predicted: any[] = [];
    let grades = [...original];
    if (addPredicted) {
      predicted = this.predictorMap[subject] || [];
      grades = this.getGradesBySubject(subject, addPredicted);
    }
    if (!grades || grades.length === 0) return this.l.s('marks.no_subjects');

    let total = 0;
    let totalDivide = 0;

    for (const grade of grades) {
      if (typeof grade.mark === "number") {
        const weight = (typeof grade.weight === "number" ? grade.weight : 0);
        let markVal = 0;
        if (grade.type === 1) { // Points
            const scale = this.marking_scales[`${grade.subject_id}_${grade.group_id}`] || this.marking_scale;
            markVal = this.getPointGrade(grade.mark, grade.max_points || 1, scale);
        } else {
            markVal = grade.mark;
        }

        if (markVal > 0) {
            total += markVal * weight;
            totalDivide += weight;
        }
      }
    }
    if (totalDivide === 0) return this.l.s('marks.no_subjects');

    const average = total / totalDivide;
    return average < 1 ? "1.00" : average.toFixed(2);
  }

  public getPointGrade(pointsRaw: string | number | null, maxPoints: number, overrideScale?: number[]): number {
    if (pointsRaw === null || pointsRaw === undefined) return 0;
    const pointsStr = String(pointsRaw);
    const points = parseFloat(pointsStr.replace(',', '.'));
    if (isNaN(points)) return 0;
    if (maxPoints <= 0) return 1;
    const percentage = (points / maxPoints) * 100;
    
    const scale = overrideScale || this.marking_scale;
    if (scale && scale.length >= 4) {
      for (let i = 0; i < 4; i++) {
        if (percentage >= scale[i]) return i + 1;
      }
      return 5;
    }
    if (percentage >= 85) return 1;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 3;
    if (percentage >= 30) return 4;
    return 5;
  }

  public getGradeClass(grade: any): string {
    if (grade === null || grade === '-') return '';
    const g = typeof grade === 'number' ? grade : parseInt(grade);
    if (isNaN(g)) return '';
    if (g === 1) return 'grade--success';
    if (g >= 4) return 'grade--danger';
    if (g === 3) return 'grade--warning';
    return 'grade--primary';
  }


  public formatMark(mark: any): string {
    if (!mark) return "";
    let mark_id: number;
    
    if (typeof mark === 'object') {
      if (mark.type === 1) { // Points
        const scale = this.marking_scales[`${mark.subject_id}_${mark.group_id}`] || this.marking_scale;
        return this.getPointGrade(mark.mark, mark.max_points || 1, scale).toString();
      }
      mark_id = mark.mark;
    } else {
      mark_id = mark;
    }

    const config = this.marksManager.getConfig();
    let idIndex = config.mark_ids.findIndex((m) => m == mark_id);
    let displayMark = config.mark_display[idIndex];
    if (displayMark) return displayMark;
    return mark_id.toString();
  }

  public getMarkTooltip(mark: any): string {
    let tooltip = `${mark.topic} (${this.utils.formatDateShort(mark.created)})`;
    if (mark.type === 1 && mark.max_points) {
        tooltip += `\n${this.l.s('marks.points')}: ${mark.mark} / ${mark.max_points}`;
    }
    if (this.markStats[mark.column_id]) {
      const stats = this.markStats[mark.column_id];
      tooltip += `\n${this.l.s('marks.class_average')}: ${stats.avg}`;
      tooltip += `\n${this.l.s('marks.class_rank')}: ${stats.rank}`;
    }
    return tooltip;
  }

  public selectMark(mark: any): void {
    if (this.selectedTab.getValue() === 2) return;
    if (mark.isPredicted) return;
    this.selectedMark = mark;
    this.modalManager.openModal('mark_detail', {
      selectedMark: mark,
      markStats: this.markStats,
      marking_scales: this.marking_scales,
      marking_scale: this.marking_scale
    });
  }

  public closeMarkDetails(): void {
    this.selectedMark = null;
    this.modalManager.closeModal('mark_detail');
  }

  /** Dynamická velikost písma podle váhy */
  public getFontSize(weight: number): number {
    const minWeight = 1;
    const maxWeight = 10;
    const minFont = 16;
    const maxFont = 24;
    if (weight <= minWeight) return minFont;
    if (weight >= maxWeight) return maxFont;
    return minFont + ((weight - minWeight) / (maxWeight - minWeight)) * (maxFont - minFont);
  }

  /** Původní seskupení známek dle předmětu */
  public getMarksPerSubject() {
    const result: { [subject: string]: any[] } = {};
    if (!this.marks) {
      return [];
    }
    for (const mark of this.marks) {
      const subject = mark.subject_name;
      if (!result[subject]) {
        result[subject] = [];
      }
      result[subject].push(mark);
    }
    return Object.entries(result).map(([subject, marks]) => ({
      subject,
      marks
    }));
  }
}
