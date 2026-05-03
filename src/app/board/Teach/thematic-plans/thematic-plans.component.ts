import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Utils } from '@Schoolingo/utils';
import { AlertManager } from '@Schoolingo/alert';

@Component({
  selector: 'app-thematic-plans',
  standalone: true,
  imports: [IconsModule, FormsModule, NgClass],
  templateUrl: './thematic-plans.component.html',
  styleUrl: './thematic-plans.component.css'
})
export class ThematicPlansComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private alertManager = inject(AlertManager);
  Utils = Utils;

  public plans: any[] = [];
  public selectedPlan: any = null;
  public isEditing = false;
  public subjects: any[] = [];
  public groups: any[] = [];
  public schoolYears: any[] = [];

  ngOnInit(): void {
    this.loadPlans();
    this.loadMetaData();
  }

  loadPlans() {
    this.http.get<any[]>(`${Config.API_URL}/v1/teach/thematic-plans`, { withCredentials: true })
      .subscribe(data => this.plans = data);
  }

  loadMetaData() {
    this.http.get<any[]>(`${Config.API_URL}/v1/school/architecture/subjects`, { withCredentials: true })
      .subscribe(data => this.subjects = data);
    this.http.get<any[]>(`${Config.API_URL}/v1/school/architecture/groups`, { withCredentials: true })
      .subscribe(data => this.groups = data);
    this.http.get<any[]>(`${Config.API_URL}/v1/school/years`, { withCredentials: true })
        .subscribe(data => this.schoolYears = data);
  }

  selectPlan(plan: any) {
    this.http.get(`${Config.API_URL}/v1/teach/thematic-plans/${plan.thematic_plan_id}`, { withCredentials: true })
      .subscribe(data => {
        this.selectedPlan = data;
        this.isEditing = true;
      });
  }

  createNewPlan() {
    this.selectedPlan = {
      name: '',
      subject_id: null,
      group_id: null,
      school_year_id: this.schoolYears.find(y => y.current)?.sy_id || null,
      items: []
    };
    this.isEditing = true;
  }

  addItem() {
    this.selectedPlan.items.push({
      topic: '',
      description: '',
      estimated_date: null,
      period: ''
    });
  }

  removeItem(index: number) {
    this.selectedPlan.items.splice(index, 1);
  }

  savePlan() {
    if (!this.selectedPlan.thematic_plan_id) {
      this.http.post(`${Config.API_URL}/v1/teach/thematic-plans`, this.selectedPlan, { withCredentials: true })
        .subscribe((res: any) => {
          this.selectedPlan.thematic_plan_id = res.thematic_plan_id;
          this.saveItems();
        });
    } else {
      this.saveItems();
    }
  }

  saveItems() {
    const itemsToSave = this.selectedPlan.items.map((item: any, index: number) => ({
        ...item,
        item_order: index + 1
    }));
    this.http.post(`${Config.API_URL}/v1/teach/thematic-plans/${this.selectedPlan.thematic_plan_id}/items`, itemsToSave, { withCredentials: true })
      .subscribe(() => {
        this.alertManager.alert('success', 'Plán byl úspěšně uložen');
        this.loadPlans();
        this.isEditing = false;
        this.selectedPlan = null;
      });
  }
}
