import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { DefaultValueAccessor, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsComponent } from '@Components/Tabs';
import { Config } from '@Schoolingo/config';
import { ContextMenu } from '@Schoolingo/context-menu';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';
import { BehaviorSubject, Subscription } from 'rxjs';

type Scope = {
  scopeId: number;
  name: string;
  shortcut: string;
  state: boolean;
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TabsComponent, NgClass, IconsModule, NgStyle],
  templateUrl: './editCompanyModal.html',
  styleUrls: ['./editCompanyModal.css', '../../../../Components/modal/modal.css']
})
export class editCompanyModalComponent {
  public showSelect: 'responsiblePerson' | 'statusCompany' | null = null;
  public selectedTab = new BehaviorSubject<number>(0);
  private context_menu = inject(ContextMenu);

  private http = inject(HttpClient);
  private listeners: Subscription[] = [];
  public l = inject(Locale);
  public traineeship = inject(Traineeship);
  Utils = Utils;

  public scopes: Record<number, Scope> = {};
  public getScopes(): any[] {
    return Object.values(this.scopes);
  }

  public setScopeState(scope: number, state: boolean): void {
    this.scopes[scope].state = state;
  }

  public page: 'main' | 'responsiblePerson' | 'newInstructor' | 'editInstructor' | 'name' | 'ico' | 'description' | 'activities' | 'equipment' | 'scopes' = 'main';

  // RP Info
  public rp_firstname = this.traineeship.selectedCompany.rp_firstName;
  public rp_lastname = this.traineeship.selectedCompany.rp_lastName;
  public rp_email = this.traineeship.selectedCompany.email;
  public rp_phone = this.traineeship.selectedCompany.phone;
  public c_name = this.traineeship.selectedCompany.name;
  public c_ico = this.traineeship.selectedCompany.ico;
  public c_description = this.traineeship.selectedCompany.description;
  public c_activity = this.traineeship.selectedCompany.activity;
  public c_equipment = this.traineeship.selectedCompany.equipment;

  // new instructor
  public newInstructor = {
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    role: ""
  }

  // edit instructor
  public editInstructorData = {
    instructorId: -1,
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    role: ""
  }
  
  ngOnInit(): void {
    const { selectedCompany, scopes } = this.traineeship;
    let companyScopes: any[] = [];
    try {
      companyScopes = JSON.parse(selectedCompany.scopes ?? '[]');
    } catch {
      console.warn('Invalid company scopes JSON:', selectedCompany.scopes);
    }

    const scopesData = companyScopes.reduce<Record<number, boolean>>(
      (acc, { scopeId, status }) => ((acc[scopeId] = status), acc),
      {}
    );

    scopes.forEach((scope) => {
      this.scopes[scope.scopeId] = scope;
      this.scopes[scope.scopeId].state = scopesData[scope.scopeId] ?? false;
    })
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public contextMenuInstructor(instructor_id: number, event: MouseEvent): void {
    event.preventDefault();

    const instructor = this.traineeship.selectedCompany.instructors.find((instructor: any) => instructor.instructorId == instructor_id)

    let items: any[] = [];

    if (instructor.status == 'active') {
      items = [
        {
          text: 'traineeship.edit_instructor',
          action: () => {
            this.context_menu.hideContextMenu();
            this.editInstructor(instructor_id);
          }
        },
        {
          text: 'traineeship.remove_instructor',
          color: 'danger',
          action: () => {
            this.context_menu.hideContextMenu();
            this.removeInstructor(instructor_id);
          }
        }
      ]
    }

    if (instructor.status == 'deleted') {
      items = [
        {
          text: 'traineeship.buttons.restore',
          action: () => {
            this.context_menu.hideContextMenu();
            this.restoreInstructor(instructor_id);
          }
        }
      ]
    }

    items.push(
      { type: 'split' },
      { text: 'close', action: () => this.context_menu.hideContextMenu() }
    )

    this.context_menu.setItems(items);
    this.context_menu.showContextMenu(event.x, event.y)
  }

  public createInstructor(): void {
    this.http.post(
      `${Config.API_URL}/v1/traineeship/instructor_new`,
      {
        company_id: this.traineeship.selectedCompany.companyId,
        firstname: this.newInstructor.firstname,
        lastname: this.newInstructor.lastname,
        email: this.newInstructor.email,
        phone: this.newInstructor.phone,
        role: this.newInstructor.role
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status == true && 'instructor' in data) {
        const instructor: any = data.instructor;
        this.traineeship.selectedCompany.instructors.push(instructor);
        this.newInstructor = {
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          role: ""
        }
        this.page = 'main';
      }
    })
  }

  public restoreInstructor(instructor_id: number): void {
    this.http.post(
      `${Config.API_URL}/v1/traineeship/instructor_restore`,
      { company_id: this.traineeship.selectedCompany.companyId, instructor_id },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status && 'instructor_id' in data) {
        this.traineeship.selectedCompany.instructors.find((instructor: any) => instructor.instructorId == data.instructor_id).status = 'active';
      }
      console.log(data);
    });
  }

  public editInstructor(instructor_id: number): void {
    this.page = 'editInstructor';
    this.editInstructorData = JSON.parse(JSON.stringify(
      this.traineeship.selectedCompany.instructors.find((instructor:any) => instructor.instructorId == instructor_id)
    ))
    console.log(this.editInstructorData);
  }

  public updateInstructor(): void {
    this.http.post(
      `${Config.API_URL}/v1/traineeship/instructor_update`,
      {
        instructor_id: this.editInstructorData.instructorId,
        firstname: this.editInstructorData.firstname,
        lastname: this.editInstructorData.lastname,
        email: this.editInstructorData.email,
        phone: this.editInstructorData.phone,
        role: this.editInstructorData.role
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status == true && 'instructor' in data) {
        const instructor: any = data.instructor;
        const instructorIndex = this.traineeship.selectedCompany.instructors.findIndex((instruct: any) => instruct.instructorId == instructor.instructor_id);
        this.traineeship.selectedCompany.instructors[instructorIndex] = {
          ...this.traineeship.selectedCompany.instructors[instructorIndex],
          ...instructor
        };
        this.page = 'main';
      }
    })
  }

  public removeInstructor(instructor_id: number): void {
    this.http.delete(
      `${Config.API_URL}/v1/traineeship/instructor?company_id=${this.traineeship.selectedCompany.companyId}&instructor_id=${instructor_id}`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status && 'instructor_id' in data) {
        this.traineeship.selectedCompany.instructors.find((instructor: any) => instructor.instructorId == data.instructor_id).status = 'deleted';
      }
      console.log(data);
    });
  }

  public updateCompany(
    types: ('name' | 'ico' | 'activity' | 'equipment' | 'description' | 'rp_firstName' | 'rp_lastName' | 'email' | 'phone')[],
    values: string[]
  ): void {
    this.http.post(
      `${Config.API_URL}/v1/traineeship/company_update`,
      { companyId: this.traineeship.selectedCompany.companyId, types, values },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status === true) {
        this.page = 'main';
        if ('types' in data && 'values' in data && Array.isArray(data.types) && Array.isArray(data.values)) {
          for(let i = 0;i < data.types.length;i++) {
            this.traineeship.selectedCompany[data.types[i]] = data.values[i];
          }
        }
      }
      console.log(data);
    });
  }

  public SaveScopesOfCompany(): void {
    if (!this.traineeship.selectedCompany) return;
    let scopes: number[] = [];
    Object.values(this.scopes).forEach((scope) => {
      if (scope.state == false) return;
      scopes.push(scope.scopeId);
    })

    this.http.post(
      `${Config.API_URL}/v1/traineeship/company_scopes`,
      {
        companyId: this.traineeship.selectedCompany.companyId,
        scopes
      },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      const company = this.traineeship.selectedCompany;
      if (
           !company?.scopes
        || !('scopes' in data)
        || !Array.isArray(data.scopes)) return;

      // parsování původních scopes (string -> objekt)
      let companyScopes: any[] = [];
      try {
        companyScopes = JSON.parse(company.scopes);
      } catch {
        console.error("Invalid company.scopes JSON");
        return;
      }

      if (data.scopes.length === 0) {
        this.traineeship.selectedCompany.scopes = '[]';
      }

      // převedeme odpověď na množinu pro rychlé porovnání
      const updatedScopeIds = new Set(data.scopes);

      // aktualizujeme status každého scope
      const updatedScopes = companyScopes.map(scope => ({
        ...scope,
        status: updatedScopeIds.has(scope.scopeId) ? 1 : 0
      }));

      this.traineeship.selectedCompany.scopes = JSON.stringify(updatedScopes);

      // vrátíme aktualizovaný objekt (a znovu uložíme scopes jako string)
      return;
    })

  }
}
