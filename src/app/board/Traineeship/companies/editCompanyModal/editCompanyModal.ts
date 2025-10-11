import { NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconsModule } from '../../../../Modules/Icons.module';

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
  styleUrls: ['../../../../Styles/input.css', './editCompanyModal.css', '../../../../Components/Modal/Modal.css']
})
export class editCompanyModalComponent {
  public showSelect: 'responsiblePerson' | 'statusCompany' | null = null;
  public selectedTab = new BehaviorSubject<number>(0);
  public schoolingo = inject(Schoolingo);

  constructor() {}

  private listeners: Subscription[] = [];
  Utils = Utils;

  public scopes: Record<number, Scope> = {};
  public getScopes(): any[] {
    if (!this.schoolingo.traineeship.selectedCompany || !this.scopes) return [];
    return Object.values(this.scopes);
  } 

  public setScopeState(scope: number, state: boolean): void {
    this.scopes[scope].state = state;
  }

  public page: 'main' | 'responsiblePerson' | 'newInstructor' | 'scopes' = 'main';

  // RP Info
  public rp_firstname = this.schoolingo.traineeship.selectedCompany.rp_firstName;
  public rp_lastname = this.schoolingo.traineeship.selectedCompany.rp_lastName;
  public rp_email = this.schoolingo.traineeship.selectedCompany.email;
  public rp_phone = this.schoolingo.traineeship.selectedCompany.phone;
  
  ngOnInit(): void {
    
    this.listeners.push(
      this.schoolingo.socketService.addFunction("school:getScopes")
      .subscribe((data: Scope[]) => {
        data.forEach((scope: Scope) => {
          console.log(scope)
          this.scopes[scope.scopeId] = scope;
        })

        const companyScopes: { scopeId: number;status: number }[] = JSON.parse(this.schoolingo.traineeship.selectedCompany.scopes);

        Object.values(companyScopes).forEach((scope) => {
          if (scope.scopeId == null || !this.scopes[scope.scopeId] || scope.status == null) return;
          this.scopes[scope.scopeId].state = scope.status ? true : false;
        })
      })
    );

    this.schoolingo.socketService.emit('school:getScopes');
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public SaveRPInfo() {
    if (!this.schoolingo.traineeship.selectedCompany) return;
    console.log(this.schoolingo.traineeship.selectedCompany)
    this.schoolingo.socketService.emit(
      "traineeship:updateRPInfo",
      {
        companyId: this.schoolingo.traineeship.selectedCompany.companyId,
        rp: {
          first_name: this.rp_firstname,
          last_name: this.rp_lastname,
          email: this.rp_email,
          phone: this.rp_phone
        }
      }
    )

    this.schoolingo.socketService.socket?.once('traineeship:updateRPInfo', (data) => {
      console.log(data);
    })
  }

  public SaveScopesOfCompany(): void {
    if (!this.schoolingo.traineeship.selectedCompany) return;
    console.log(this.schoolingo.traineeship.selectedCompany)
    let scopes: number[] = [];
    Object.values(this.scopes).forEach((scope) => {
      if (scope.state == false) return;
      scopes.push(scope.scopeId);
    })
    this.schoolingo.socketService.emit(
      "traineeship:updateCompanyScopes",
      {
        companyId: this.schoolingo.traineeship.selectedCompany.companyId,
        scopes
      }
    )

    this.schoolingo.socketService.socket?.once('traineeship:updateCompanyScopes', (data) => {
      console.log(data);
    })
  }
}
