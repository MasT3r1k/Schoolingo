import { Component, OnInit } from '@angular/core';
import { FormInput, FormList, FormManager } from '@Schoolingo/FormManager';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';

type TraineeManagePage = 'main' | 'createCompany';

@Component({
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css', '../../board.css', '../../../input.css']
})
export class ManageComponent implements OnInit {
  constructor(
    public locale: Locale,
    private formList: FormList,
    private socketService: SocketService
  ) {}

  public page: TraineeManagePage = 'main';
  public formName: string = 'traineeship_CreateCompany';
  public form: FormManager = this.formList.getForm(this.formName) as FormManager;

  ngOnInit(): void {
    this.form = this.formList.getForm(this.formName) as FormManager;
  }

  public CompanyAdd_inputs: FormInput[] = [
    {
      type: 'text',
      name: 'companyName',
      label: 'traineeship/companyName',
      required: true,
    },
    {
      type: 'text',
      name: "officeAddress",
      label: 'traineeship/officeAddress',
      required: true,
    },
    {
      type: 'text',
      name: 'traineeAddress',
      label: 'traineeship/traineeAddress',
      required: true,
    },
    {
      type: 'url',
      name: 'web',
      label: 'web',
      required: true,
    },
    {
      type: 'text',
      name: 'contact',
      label: 'contact',
      required: true,
    }
  ];

  public CompanyAdd_buttons = [
    {
      label: 'traineeship/addCompany',
      executed: 'traineeship/addingCompany',
      func: (form: FormManager) => this.addCompany(form)
    }
  ];


  public addCompany(form: FormManager): void {
    form.execute()

    this.socketService.getSocket().Socket?.emit('traineeship/addCompany', form.formData.value);
    
  }


}
