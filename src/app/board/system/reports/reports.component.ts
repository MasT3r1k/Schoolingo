import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';

export type ReportType = 'student_list' | 'student_marks' | 'class_marks' | 'grade_overview' | null;

export interface ReportColumn {
  id: string;
  key: string;
  label: string;
  displayHeader: string;
  minWidth: number;
  width: number;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  minWidth?: number;
  width?: number;
}

export interface ColumnGroup {
  key: string;
  label: string;
  columns: ColumnDefinition[];
}

export interface PreviewGroup {
  groupLabel: string;
  rows: Record<string, any>[];
}

export interface Grouping {
  key: string;
  label: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private sanitizer = inject(DomSanitizer);
  public Utils = Utils;
  public moment = moment;

  // ── Report selection ──────────────────────────────────────
  public activeReport: ReportType = null;
  public isLoading = false;

  // ── API data ──────────────────────────────────────────────
  public classes: any[] = [];
  public students: any[] = [];

  public selection = {
    classId: null as number | null,
    studentId: null as number | null
  };

  public pdfUrl: any = null;
  public rawBlob: Blob | null = null;
  public reportData: any = null;

  // ── Editor state ──────────────────────────────────────────
  public reportTitle = '';
  public reportSubtitle = '';
  public showTitles = true;
  public orientation: 'portrait' | 'landscape' = 'portrait';
  public fontSize = 10;
  public lineHeight = '1.0';
  public pageSize = 'full';
  public currentPage = 1;
  public totalPages = 1;

  // ── Zoom & Pan state ──────────────────────────────────────
  public zoom = 0.48;
  public panX = 0;
  public panY = 0;
  private isPanning = false;
  private startX = 0;
  private startY = 0;

  // Column editor
  public activeColumns: ReportColumn[] = [];
  public selectedColumnIndex = -1;
  public groupings: Grouping[] = [];

  // Preview data (real)
  public previewGroups: PreviewGroup[] = [];

  public get pagedPreviewGroups(): PreviewGroup[] {
    const rowsPerPage = 35; // Fixed rows per page for preview
    const start = (this.currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    // Flatten to count individual rows
    let allRowsWithGroup: {groupLabel: string, row: any}[] = [];
    this.previewGroups.forEach(g => {
      g.rows.forEach(r => {
        allRowsWithGroup.push({ groupLabel: g.groupLabel, row: r });
      });
    });

    const pagedEntries = allRowsWithGroup.slice(start, end);
    
    // Re-group for the current page
    const result: PreviewGroup[] = [];
    pagedEntries.forEach(entry => {
      let group = result.find(rg => rg.groupLabel === entry.groupLabel);
      if (!group) {
        group = { groupLabel: entry.groupLabel, rows: [] };
        result.push(group);
      }
      group.rows.push(entry.row);
    });
    
    return result;
  }

  // Width calculations (A4 portrait: 175mm usable)
  public pageContentWidth = 175;
  public get usedWidth(): number {
    return this.activeColumns.reduce((sum, c) => sum + (c.width || 0), 0);
  }

  // ── Column tree (left panel) ──────────────────────────────
  public expandedGroups: Record<string, boolean> = { student: true, subjects: true };

  public columnGroups: ColumnGroup[] = [
    {
      key: 'student',
      label: 'Žák',
      columns: [
        { key: 'full_name',    label: 'Jméno a příjmení',           minWidth: 40, width: 49 },
        { key: 'birthday',     label: 'Datum narození',              minWidth: 20, width: 28 },
        { key: 'birthnum',     label: 'Rodné číslo',                 minWidth: 22, width: 29 },
        { key: 'phone',        label: 'Mobilní telefon',             minWidth: 22, width: 28 },
        { key: 'phone2',       label: 'Telefon',                     minWidth: 22, width: 28 },
        { key: 'email',        label: 'Email',                       minWidth: 30, width: 40 },
        { key: 'address',      label: 'Adresa (trvalé bydliště)',    minWidth: 50, width: 85 },
        { key: 'address2',     label: 'Adresa (korespondenční)',     minWidth: 50, width: 70 },
        { key: 'class_order',  label: 'Číslo v třídním výkazu',     minWidth: 10, width: 12 },
        { key: 'insurance_id', label: 'Kód zdravotní pojišťovny',   minWidth: 10, width: 14 },
        { key: 'gender',       label: 'Pohlaví',                    minWidth: 12, width: 16 },
      ]
    },
    {
      key: 'class',
      label: 'Třída',
      columns: [
        { key: 'class_name',     label: 'Zkratka třídy', minWidth: 12, width: 17 },
        { key: 'field_of_study', label: 'Obor',          minWidth: 30, width: 40 },
        { key: 'year',           label: 'Ročník',        minWidth: 10, width: 12 },
      ]
    },
    {
      key: 'guardian',
      label: 'Zákonný zástupce',
      columns: [
        { key: 'guardian1_name', label: 'Zákonný zástupce 1', minWidth: 30, width: 45 },
        { key: 'guardian2_name', label: 'Zákonný zástupce 2', minWidth: 30, width: 45 },
      ]
    },
    {
      key: 'subjects',
      label: 'Předměty',
      columns: []
    },
    {
      key: 'other',
      label: 'Ostatní',
      columns: [
        { key: 'age_with_absv', label: 'Počet let doch. včetně (ABSOLV_LET)', minWidth: 10, width: 14 },
        { key: 'skri',          label: 'SKRI_',                               minWidth: 10, width: 12 },
      ]
    }
  ];

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit() {
    this.loadClasses();
    this.loadSubjects();
  }

  // ── API methods ───────────────────────────────────────────
  public loadClasses() {
    this.http.get<any>(`${Config.API_URL}/v1/school/classes`, { withCredentials: true })
      .subscribe({ next: (res) => { this.classes = res.data || res; } });
  }

  public loadSubjects() {
    this.http.get<any>(`${Config.API_URL}/v1/school/subjects`, { withCredentials: true })
      .subscribe({ next: (res) => {
        const subjects = res.data || res;
        const group = this.columnGroups.find(g => g.key === 'subjects');
        if (group) {
          group.columns = subjects.map((s: any) => ({
            key: `subject_${s.subject_id}`,
            label: s.label || s.subject_name,
            minWidth: 12,
            width: 15
          }));
        }
      } });
  }

  public onClassChange() {
    if (this.selection.classId) {
      this.loadStudents(this.selection.classId);
    } else {
      this.students = [];
      this.selection.studentId = null;
    }
  }

  public loadStudents(classId: number) {
    this.http.get<any>(`${Config.API_URL}/v1/students?classId=${classId}`, { withCredentials: true })
      .subscribe({ next: (res) => { this.students = res.data || res; } });
  }

  // ── Can generate ──────────────────────────────────────────
  public canGenerate(): boolean {
    if (!this.activeReport) return false;
    if (this.activeReport === 'class_marks') {
      return !!this.selection.classId;
    }
    if (this.activeColumns.length === 0) return false;
    if (this.activeReport === 'student_list' && !this.selection.classId) return false;
    if ((this.activeReport === 'student_marks' || this.activeReport === 'grade_overview') && !this.selection.studentId) return false;
    return true;
  }

  // ── Report type selection ─────────────────────────────────
  public selectReport(type: ReportType) {
    this.activeReport = type;
    this.reportData = null;
    this.pdfUrl = null;
    this.rawBlob = null;
    this.selection.classId = null;
    this.selection.studentId = null;
    this.previewGroups = [];

    // Set default title
    if (type) {
      this.reportTitle = this.l.s('reports.types.' + type) || 'Sestava';
    }

    // Apply default columns
    this.applyDefaultColumns(type);
  }

  public applyDefaultColumns(type: ReportType) {
    if (type === 'student_list') {
      this.activeColumns = [
        this.makeColumn('class_name',  'Zkratka třídy', 'Třída',                    17, 17),
        this.makeColumn('full_name',   'Jméno a příjmení', 'Jméno Žáka',            40, 44),
        this.makeColumn('birthnum',    'Rodné číslo', 'Rodné číslo',                22, 29),
        this.makeColumn('address',     'Adresa (trvalé bydliště)', 'Adresa (trvalé bydliště)', 50, 85),
      ];
      this.groupings = [{ key: 'class_name', label: 'Třída' }];
    } else if (type === 'student_marks') {
      this.activeColumns = [
        this.makeColumn('full_name', 'Jméno a příjmení', 'Jméno', 40, 50),
        this.makeColumn('class_name', 'Třída', 'Třída', 12, 16),
      ];
      this.groupings = [];
    } else if (type === 'class_marks') {
      this.activeColumns = [
        this.makeColumn('class_order', '#', '#', 10, 10),
        this.makeColumn('full_name', 'Jméno a příjmení', 'Jméno Žáka', 40, 50),
      ];
      this.groupings = [];
    } else {
      this.activeColumns = [];
      this.groupings = [];
    }
  }

  private makeColumn(key: string, label: string, displayHeader: string, minWidth: number, width: number): ReportColumn {
    return { id: `${key}_${Date.now()}_${Math.random()}`, key, label, displayHeader, minWidth, width };
  }

  // ── Column tree interactions ──────────────────────────────
  public toggleGroup(key: string) {
    this.expandedGroups[key] = !this.expandedGroups[key];
  }

  public addColumn(col: ColumnDefinition) {
    // Prevent duplicates
    if (this.activeColumns.some(c => c.key === col.key)) return;

    const newCol: ReportColumn = {
      id: `${col.key}_${Date.now()}`,
      key: col.key,
      label: col.label,
      displayHeader: col.label,
      minWidth: col.minWidth ?? 20,
      width: col.width ?? 30
    };
    this.activeColumns.push(newCol);
  }

  public addSpecialColumn() {
    const newCol: ReportColumn = {
      id: `special_${Date.now()}`,
      key: 'custom',
      label: 'Speciální sloupec',
      displayHeader: 'Speciální sloupec',
      minWidth: 15,
      width: 25
    };
    this.activeColumns.push(newCol);
    this.selectedColumnIndex = this.activeColumns.length - 1;
  }

  public removeColumn(index: number) {
    this.activeColumns.splice(index, 1);
    if (this.selectedColumnIndex >= this.activeColumns.length) {
      this.selectedColumnIndex = this.activeColumns.length - 1;
    }
  }

  public selectColumn(index: number) {
    this.selectedColumnIndex = this.selectedColumnIndex === index ? -1 : index;
  }

  // ── Cell value helper ─────────────────────────────────────
  public getCellValue(row: Record<string, any>, key: string): string {
    // Composite address
    if (key === 'address') {
      const street = row['street'];
      const num = row['house_number'];
      const city = row['city_name'];
      const psc = row['postcode'];
      
      if (!street && !num && !city && !psc && row['address']) {
        return String(row['address']);
      }

      let addr = '';
      if (street) addr += street;
      if (num) addr += (addr ? ' ' : '') + num;
      if (city || psc) addr += (addr ? ', ' : '') + (psc ? psc + ' ' : '') + city;
      return addr;
    }

    if (key === 'gender') {
      const g = row['gender'];
      if (g === null || g === undefined) return '';
      return this.l.s('genders.' + Utils.getGender(Number(g)));
    }

    const val = row[key];
    if (val === null || val === undefined || val === '') return '';

    // Specifically handle subject keys (subject_ID)
    if (key.startsWith('subject_')) {
      return String(val);
    }

    // Date formatting
    if (key === 'birthday' || key === 'start_study' || key === 'created') {
      return moment(val).format('DD.MM.YYYY');
    }

    return String(val);
  }

  // ── Shrink to fit logic ───────────────────────────────────
  public calculateFontSize(text: string, widthMm: number): string {
    if (!text || !widthMm) return 'inherit';

    // Base font size in the preview is roughly 7.5px (defined in CSS)
    // We'll calculate if the text likely overflows.
    // Average char width at 7.5px is roughly 4-5px.
    // 1mm is roughly 3.8px.
    const containerWidthPx = widthMm * 3.8;
    const estimatedTextWidth = text.length * 4.5; // very rough estimation

    if (estimatedTextWidth > containerWidthPx) {
      const ratio = containerWidthPx / estimatedTextWidth;
      const newSize = Math.max(5, Math.min(7.5, 7.5 * ratio));
      return newSize + 'px';
    }

    return 'inherit';
  }

  // ── Grouping ──────────────────────────────────────────────
  public removeGrouping(key: string) {
    this.groupings = this.groupings.filter(g => g.key !== key);
  }

  // ── Layout helpers ────────────────────────────────────────
  public applyBaseLayout() {
    if (this.activeColumns.length === 0) return;
    const perCol = Math.floor(this.pageContentWidth / this.activeColumns.length);
    this.activeColumns.forEach(c => c.width = perCol);
  }

  public autoFitColumns() {
    if (this.activeColumns.length === 0) return;
    const total = this.usedWidth || this.activeColumns.length * 30;
    const scale = this.pageContentWidth / total;
    this.activeColumns.forEach(c => c.width = Math.round(c.width * scale));
  }

  // ── Page nav ──────────────────────────────────────────────
  public prevPage() { if (this.currentPage > 1) this.currentPage--; }
  public nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ── Report generation ─────────────────────────────────────
  public generateReport() {
    this.isLoading = true;
    this.reportData = null;
    this.pdfUrl = null;
    this.rawBlob = null;
    this.previewGroups = [];

    let fetchUrl = '';
    let fetchParams: any = {};

    switch (this.activeReport) {
      case 'student_list':
        fetchUrl = `${Config.API_URL}/v1/students`;
        if (this.selection.classId) fetchParams.classId = this.selection.classId;
        fetchParams.limit = 1000; // Get all students for the report
        break;
      case 'student_marks':
        fetchUrl = `${Config.API_URL}/v1/marks/midterm`;
        if (this.selection.studentId) fetchParams.student_id = this.selection.studentId;
        break;
      case 'class_marks':
        fetchUrl = `${Config.API_URL}/v1/marks/class`;
        if (this.selection.classId) fetchParams.classId = this.selection.classId;
        break;
      case 'grade_overview':
        fetchUrl = `${Config.API_URL}/v1/marks/midterm`;
        if (this.selection.studentId) fetchParams.student_id = this.selection.studentId;
        break;
    }

    if (!fetchUrl) { this.isLoading = false; return; }

    this.http.get<any>(fetchUrl, { params: fetchParams, withCredentials: true })
      .subscribe({
        next: (res) => {
          if (this.activeReport === 'class_marks') {
            this.reportData = res.data;
            this.updateColumnsFromSubjects(res.subjects);
          } else {
            this.reportData = res.data || res;
          }
          this.buildPreviewGroups(this.reportData);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching report data:', err);
          this.isLoading = false;
        }
      });
  }

  private updateColumnsFromSubjects(subjects: any[]) {
    // Keep baseline columns (like order and name)
    this.activeColumns = [
      this.makeColumn('class_order', '#', '#', 10, 10),
      this.makeColumn('full_name', 'Jméno a příjmení', 'Jméno Žáka', 40, 50),
    ];

    // Add subject columns (only those not already present)
    subjects.forEach(sub => {
      const key = `subject_${sub.subject_id}`;
      if (!this.activeColumns.some(c => c.key === key)) {
        this.activeColumns.push(
          this.makeColumn(key, sub.subject_name, sub.subject_short || sub.subject_name.substring(0, 3), 12, 12)
        );
      }
    });

    // If landscape, we have more room (277mm usable)
    const usableWidth = this.orientation === 'landscape' ? 277 : 175;
    this.pageContentWidth = usableWidth;
    
    // Auto-fit if it's too wide or too narrow
    this.autoFitColumns();
  }

  private buildPreviewGroups(data: any[]) {
    if (!Array.isArray(data) || data.length === 0) { this.previewGroups = []; return; }

    if (this.groupings.length === 0) {
      this.previewGroups = [{ groupLabel: '', rows: data }];
      this.totalPages = Math.max(1, Math.ceil(data.length / 35));
      return;
    }

    const groupKey = this.groupings[0].key;
    const groupMap = new Map<string, any[]>();
    for (const row of data) {
      const gVal = row[groupKey] ?? '—';
      if (!groupMap.has(gVal)) groupMap.set(gVal, []);
      groupMap.get(gVal)!.push(row);
    }
    this.previewGroups = Array.from(groupMap.entries()).map(([k, v]) => ({ groupLabel: k, rows: v }));
    this.totalPages = Math.max(1, Math.ceil(data.length / 35));
  }

  // ── Save / Export / Print ─────────────────────────────────
  public saveReport() {
    console.log('Save report – to be implemented');
  }

  public downloadPdf() {
    if (!this.rawBlob) return;
    const url = window.URL.createObjectURL(this.rawBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.activeReport}_${this.Utils.formatDateShort(this.moment())}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  public printPdf() {
    window.print();
  }

  // ── Helpers ───────────────────────────────────────────────
  public getSelectedClassName(): string {
    const cls = this.classes.find(c => (c.id || c.class_id) == this.selection.classId);
    return cls?.name || cls?.class_name || '';
  }

  public getSelectedStudentName(): string {
    const student = this.students.find(s => (s.id || s.student_id) == this.selection.studentId);
    if (!student) return '';
    return `${student.last_name} ${student.first_name}`;
  }

  // ── Zoom & Pan Interaction ────────────────────────────────
  public onWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      this.zoom = Math.min(2, Math.max(0.2, this.zoom + delta));
    }
  }

  public onPanStart(event: MouseEvent) {
    if (event.button !== 0) return; // Only left click
    this.isPanning = true;
    this.startX = event.clientX - this.panX;
    this.startY = event.clientY - this.panY;
    event.preventDefault();
  }

  public onPanMove(event: MouseEvent) {
    if (!this.isPanning) return;
    this.panX = event.clientX - this.startX;
    this.panY = event.clientY - this.startY;
  }

  public onPanEnd() {
    this.isPanning = false;
  }

  public resetZoom() {
    this.zoom = this.orientation === 'landscape' ? 0.34 : 0.48;
    this.panX = 0;
    this.panY = 0;
  }

  public setZoom(val: string | number) {
    if (val === 'full') {
      this.resetZoom();
      return;
    }
    this.zoom = Number(val) / 100;
  }

  public getTransform(): string {
    return `scale(${this.zoom}) translate(${this.panX / this.zoom}px, ${this.panY / this.zoom}px)`;
  }

  public reset() {
    this.pdfUrl = null;
    this.activeReport = null;
    this.reportData = null;
    this.selection.classId = null;
    this.selection.studentId = null;
    this.rawBlob = null;
    this.activeColumns = [];
    this.groupings = [];
    this.previewGroups = [];
    this.selectedColumnIndex = -1;
    this.currentPage = 1;
    this.totalPages = 1;
    this.resetZoom();
  }
}
