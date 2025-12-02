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
import { BehaviorSubject } from 'rxjs';

interface PredictorGrade {
  subjectName: string;
  mark: number;
  weight: number;
  topic: string;
  type: number;
  created: Date;
  id: number;
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
  public marks: any;
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

  ngOnInit(): void {
    this.http
      .post(
        `${Config.API_URL}/v1/marks/student`,
        { student_id: this.auth.getId() },
        { withCredentials: true }
      )
      .subscribe((data) => {
        if ('marks' in data) {
          this.marks = data.marks;
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
      subjectName: this.selected_subject,
      mark: parseFloat(this.selected_mark.toString()),
      weight: parseInt(this.selected_weight.toString()),
      topic: this.l.s('marks.predictor.title'),
      type: 0,
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
      this.selected_subject = mark.subjectName;
      this.selected_mark = mark.mark;
      this.selected_weight = mark.weight;
    } else {
      if (!this.predictorMap[this.selected_subject]) return;
      const markIndex2 = this.predictorMap[this.selected_subject].findIndex((mark: any) => mark.id == id);
      if (markIndex2 === -1) return;
      const mark = this.predictorMap[this.selected_subject][markIndex2];
      this.selected_subject = mark.subjectName;
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
      subjectsSet.add(mark.subjectName);
    });
    return Array.from(subjectsSet);
  }

  /** Všechny známky včetně predikcí */
  public getGradesBySubject(subject: string, addPredicted: boolean = false): any[] {
    const original = this.marksCopy?.filter((mark: any) => mark.subjectName === subject) || [];
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
    const original = this.marks?.filter((mark: any) => mark.subjectName === subject) || [];
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
      if (grade.type === 0 && typeof grade.mark === "number") {
        const weight = (typeof grade.weight === "number" ? parseInt(grade.weight) : 0) + 1;
        total += parseFloat(grade.mark) * weight;
        totalDivide += weight;
      }
    }
    if (totalDivide === 0) return this.l.s('marks.no_subjects');

    const average = total / totalDivide;
    return average < 1 ? "1.00" : average.toFixed(2);
  }

  public formatMark(mark_id: number): string {
    const config = this.marksManager.getConfig();
    let idIndex = config.mark_ids.findIndex((mark) => mark == mark_id);
    let displayMark = config.mark_display[idIndex];
    if (displayMark) return displayMark;
    return mark_id.toString();
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
      const subject = mark.subjectName;
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
