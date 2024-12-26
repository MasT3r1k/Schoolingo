import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import sidebar from './sidebar';
import { NgClass } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { SettingsItem } from './sidebar.d';
import { FormInput, FormManager } from '@Components/Forms/FormManager';

@Component({
  standalone: true,
  imports: [NgClass, FormManager],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class SettingsComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public selectedItem: string = Object.keys(sidebar)[0] + ':' + Object.values(sidebar)[0][0].label;
  public options: Record<string, Record<string, BehaviorSubject<string | boolean | any>>> = {
    "login_title": {
      "allowForgotPassword": new BehaviorSubject(true)
    },
    "system/settings/otherModules:sidebar/messages/main": {
      "seeOtherMessages": new BehaviorSubject(true)
    }
  };

  public items: Record<string, Record<string, SettingsItem[]>> = {
    "": {
      "system/settings/system": [{
        label: "Nastavení nějaké random",
        type: "checkbox"
      }],
      "sidebar/school/main": [{
        label: "school/code",
        type: "input"
      },
      {
        label: "school/wannaOwnCode",
        type: 'note'
      },
      {
        label: "school/name",
        type: "input"
      }]
    },
    "system/settings/otherModules": {
      "sidebar/traineeship/main": [{
        label: "Hlavní správce",
        description: "Vyberte osobu, která bude zodpovídat za praxe a bude mít veškeré práva",
        type: 'input'
      }]
    }
  }

  public inputs: FormInput[] = [
    {
      type: 'text',
      name: 'schoolCode',
      placeholder: 'school/code',
      label: 'school/code',
      readonly: true,
      notes: [
        {
          note: 'school/wannaOwnCode'
        }
      ]
    },
    {
      type: 'text',
      name: 'schoolName',
      placeholder: 'school/name',
      label: 'school/name',
      value: () => { return this.schoolingo.school.schoolInfo.name },
      required: true,
    },
    {
      type: 'text',
      name: 'schoolAddress',
      placeholder: 'address',
      label: 'address',
      required: true,
    },
    {
      type: 'select',
      select: 'search',
      name: 'schoolDistrict',
      placeholder: 'school/searchDistrict',
      label: 'district',
      options: ["Benešov","Beroun","Blansko","Brno-město","Brno-venkov","Bruntál","Břeclav","Cheb","Chomutov","Chrudim","České Budějovice","Český Krumlov","Česká Lípa","Domažlice","Děčin","Frýdek-Místek","Havlíčkův Brod","Hodonín","Hradec Králové","Jablonec nad Nisou","Jeseník","Jihlava","Jindřichův Hradec","Jičín","Karlovy Vary","Karviná","Kladno","Klatovy","Kolín","Kroměříž","Kutná Hora","Liberec","Litoměřice","Louny","Mladá Boleslav","Most","Mělník","Nový Jičín","Nymburk","Náchod","Olomouc","Opava","Ostrava-město","Pardubice","Pelhřimov","Plzeň-jih","Plzeň-město","Plzeň-sever","Prachatice","Praha 1","Praha 2","Praha 3","Praha 4","Praha 5","Praha 6","Praha 7","Praha 8","Praha 9","Praha 10","Praha-východ","Praha-západ","Prostějov","Písek","Přerov","Příbram","Rakovník","Rokycany","Rychnov nad Kněžnou","Semily","Sokolov","Strakonice","Svitavy","Šumperk","Tachov","Teplice","Trutnov","Tábor","Třebíč","Uherské Hradiště","Ústí nad Labem","Ústí nad Orlicí","Vsetín","Vyškov","Zlín","Znojmo","Ždár nad Sázavou"],
      value: () => this.schoolingo.school.schoolInfo.district,
      onSelect: (option: string) => { this.schoolingo.school.schoolInfo.district = option },
      notes: [
        {
          note: "school/dontSeeDistrict"
        }
      ],
    },
    {
      type: 'text',
      name: 'schoolStarts',
      placeholder: 'school/startHours',
      label: 'school/startHours',
      required: true,
      value: () => { return this.schoolingo.school.schoolInfo.startHour.join(':') }
    },
    {
      type: 'text',
      name: 'schoolLessonLength',
      placeholder: 'school/LessonLength',
      label: 'school/LessonLength',
      required: true,
      value: () => { return this.schoolingo.school.schoolInfo.lessonHour }
    },
    {
      type: 'text',
      name: 'schoolDefaultBreakTime',
      placeholder: 'school/defaultBreakTime',
      label: 'school/defaultBreakTime',
      notes: [
        {
          note: "school/defaultBreakTimeNote"
        }
      ],
      required: true,
      value: () => { return this.schoolingo.school.schoolInfo.breakTime }
    },
  ];

  public getSidebar(): any {
    return Object.entries(sidebar);
  }

}
