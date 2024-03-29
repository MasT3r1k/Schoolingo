import { Component, OnInit } from '@angular/core';
import { FormButton, FormInput, FormList, FormManager } from '@Schoolingo/FormManager';
import { Locale } from '@Schoolingo/Locale';

@Component({
  templateUrl: './school-settings.component.html',
  styleUrls: ['../../board.css', './school-settings.component.css']
})
export class SchoolSettingsComponent implements OnInit {

  public formName: string = 'SchoolSettingsForm';
  public form!: FormManager;

  constructor(
    public locale: Locale,
    private formList: FormList
  ) {}

  public selectedDistrict: string = 'Písek';
  public getSchoolDistrict(): string {
    return this.selectedDistrict;
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
      value: () => this.getSchoolDistrict(),
      onSelect: (option: string) => { this.selectedDistrict = option },
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
    },
    {
      type: 'text',
      name: 'schoolLessonLength',
      placeholder: 'school/LessonLength',
      label: 'school/LessonLength',
      required: true,
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
    },
  ];

  public buttons: FormButton[] = [
    {
      label: 'school/saveSettings',
      executed: 'school/savingSettings',
    }
  ]

  ngOnInit(): void {
    this.form = this.formList.getForm(this.formName) as FormManager;
  }


  ngOnDestroy(): void {
    this.form?.removeMe();
  }


}
