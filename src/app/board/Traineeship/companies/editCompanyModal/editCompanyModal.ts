import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { BehaviorSubject } from 'rxjs';
import { IconsModule } from '../../../../Modules/Icons.module';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TabsComponent, NgClass, IconsModule, NgStyle],
  templateUrl: './editCompanyModal.html',
  styleUrls: ['../../../../Styles/input.css', './editCompanyModal.css', '../../../../Components/Modal/Modal.css']
})
export class editCompanyModalComponent {
  public showSelect: 'responsiblePerson' | 'statusCompany' | null = null;
  public selectedTab = new BehaviorSubject<number>(0);

  constructor(
    public schoolingo: Schoolingo
  ) {}

  Utils = Utils;

  public page: 'main' | 'responsiblePerson' | 'newInstructor' = 'main';
}
