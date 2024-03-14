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

  public inputs: FormInput[] = [
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
    this.form.removeMe();
  }


}
