import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Country } from 'country-state-city';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Data, dataAPI, DatalistComponent, errorAPI } from '@Components/datalist';
import { TabsComponent } from '@Components/Tabs';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';
import { Permission } from '@Schoolingo/permission';
import { Config } from '@Schoolingo/config';
import { DiaryWeek, Traineeship } from '@Schoolingo/traineeship';
import { Locale } from '@Schoolingo/locale';
import { Theme } from '@Schoolingo/theme';
import { Authentication } from '@Schoolingo/authentication';
import { ModalManager } from '@Schoolingo/modal';
import { editCompanyModalComponent } from './editCompanyModal/editCompanyModal';
import { selectCompanyModalComponent } from './selectCompanyModal/selectCompanyModal';

type Scope = {
  scopeId: number;
  name: string;
  shortcut: string;
  status: boolean;
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent, TabsComponent, NgClass, NgStyle, IconsModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  public auth = inject(Authentication);
  private router = inject(Router);
  public modalManager = inject(ModalManager);
  public sanitizer = inject(DomSanitizer);
  public l = inject(Locale);
  public t = inject(Theme);
  public permissions = inject(Permission);
  public traineeship = inject(Traineeship);

  country = Country;
  Config = Config;
  Utils = Utils;

  public scopes: Record<number, Scope> = {};
  public showPage: 'list' | 'detailCompany' | 'requestCompany' = 'list';
  public alert: 'success_selected_company' | 'success_updated_instructor' | 'too_many_students_in_company' | null = null;
  public requestDataForAlert: any = {};
  public selectedTab = new BehaviorSubject<number>(0);

  onClick = (id: { id: number }[]) => {
    this.http.get<companyInfoAPI>(
      `${Config.API_URL}/v1/traineeship/company_info?companyId=${id[0].id}`,
      { withCredentials: true }
    )
    .subscribe((data: companyInfoAPI) => {
      this.traineeship.selectedCompany = data;
      this.weeks = this.traineeship.getDiaryByCompanyId(data.companyId);
      this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://maps.google.com/maps?q=' + this.traineeship.selectedCompany.street + ' ' + this.traineeship.selectedCompany.houseNumber + ', ' + this.traineeship.selectedCompany.cityName + '&output=embed');
    })
    this.showPage = 'detailCompany';
    this.traineeship.selectedDairy = null;
    this.traineeship.selectedInstructor = null;
    this.selectedTab.next(0);
    this.router.navigate(['/traineeship/companies/', id[0].id]);
  }

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  public creatingCompany: {[key: string]: string} = {
    name: "",
    dic: "",
    street: "",
    houseNumber: "",
    city: "",
    postcode: "",
    web: ""
  };

  public countryCodes = ['CZ'];
  public countryCode = 'CZ';

  private listeners: Subscription[] = [];
  public companies = new BehaviorSubject<Data[][] | any>([]);
  public weeks: DiaryWeek[] = [];
  public search = new FormControl();
  public dic = new FormControl();
  public iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl("");
  public reviews: any[] = [];

  public scopeSupported: string[] = [];
  public toggleScope(scopeName: string,state: boolean): void {
    if (this.scopeSupported.includes(scopeName) && state == false) {
      this.scopeSupported.slice(this.scopeSupported.indexOf(scopeName));
      return;
    }

    if (!this.scopeSupported.includes(scopeName) && state == true) {
      this.scopeSupported.push(scopeName);
      return;
    }
  }

  public metadata = {
    rows: 0,
    limit: 50
  };

  public tableHead: string[] = [];

  datalist: DatalistComponent | null = null;
  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  public goToList(): void {
    this.showPage = 'list';
    this.router.navigate(['/traineeship/companies']);
  }

  public requestCompany(): void {
    this.router.navigate(['/traineeship/companies/new']);
  }
  public selectedCompanyListOption = new BehaviorSubject<number>(0);
  public getCompanyListOptions(hideLocale: boolean = false): string[] {
    let arr: string[] = [
      (!hideLocale ? 'traineeship.status_company.' : '') + 'approved',
      (!hideLocale ? 'traineeship.status_company.' : '') + 'acceptable',
      (!hideLocale ? 'traineeship.status_company.' : '') + 'request',
    ];
    
    if (this.permissions.checkPermission(["manager:traineeship:manage"])) {
      arr.push((!hideLocale ? 'traineeship.status_company.' : '') + 'deleted');
    }
    
    return arr;
  }

  public getDisabledLocales(): boolean[] {
    let arr: boolean[] = [];
    Object.keys(this.scopes).forEach((value: string) => {
      let id = parseInt(value);
      arr[id + 1] = this.scopes[id] ? true : false;
    })
    return arr;
  }

  public getTableTitles(): string[] {
    let arr: string[] = [];
    Object.keys(this.scopes).forEach((value: string) => {
      let id = parseInt(value);
      arr[id + 2] = this.scopes[id]?.name ?? "";
    })
    return arr;
  }

  public refreshSelectedCompany(): void {
    let idFromUrl = this.route.snapshot.paramMap.get("id");
    if (idFromUrl == "new") {
      this.showPage = "requestCompany";
      this.traineeship.selectedCompany = "new";
      return;
    }

    if (idFromUrl == undefined) {
      this.showPage = 'list';
      this.traineeship.selectedCompany = null;
      this.traineeship.selectedDairy = null;
      this.traineeship.selectedInstructor = null;
      return;
    }

    this.onClick([{ id: parseInt(idFromUrl) }]);
  }

  public isValidVAT(dic: string, countryCode: string): boolean {
    const cleanDic = countryCode + dic.trim().toUpperCase();
    const validators: Record<string, (vat: string) => boolean> = {
      CZ: (vat) => /^CZ\d{8,10}$/.test(vat),
      SK: (vat) => /^SK\d{10}$/.test(vat),
      DE: (vat) => /^DE\d{9}$/.test(vat),
      FR: (vat) => /^FR[A-Z0-9]{2}\d{9}$/.test(vat),
      IT: (vat) => /^IT\d{11}$/.test(vat),
      // přidej další státy dle potřeby
    };

    return !!validators[countryCode]?.(cleanDic);
  }

  public removeCompany(): void {
    if (!this.permissions.checkPermission(["manager:traineeship:removeCompany"])) return;
    Swal.fire({
      title: this.l.s("traineeship.alerts.remove_company_title"),
      text: this.l.s("traineeship.alerts.remove_company_description"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--red)",
      customClass: {
        cancelButton: "gray",
      },
      confirmButtonText: this.l.s("traineeship.remove_company"),
      cancelButtonText: this.l.s("buttons.cancel"),
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  }

  ngOnInit(): void {
    this.listeners.push(
      this.dic.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        if (this.isValidVAT(value, this.countryCode)) {
          switch (this.countryCode) {
            case 'CZ':
              const ico = this.dic.value.replace(/^CZ/, '');

              this.http.get(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`)
                .subscribe({
                  next: (data: any) => {
                    Swal.fire({
                      title: this.l.s("traineeship.alerts.company_found_title"),
                      text: this.l.s("traineeship.alerts.company_found_description").replaceAll('%companyName%', data.obchodniJmeno),
                      icon: "success",
                      showCancelButton: true,
                      confirmButtonColor: "var(--primary)",
                      cancelButtonColor: "var(--red)",
                      confirmButtonText: this.l.s("traineeship.alerts.company_found_agree"),
                      cancelButtonText: this.l.s("traineeship.alerts.company_found_cancel"),
                      reverseButtons: true
                    }).then((result) => {
                      if (result.isConfirmed) {
                        this.creatingCompany['name'] = data.obchodniJmeno;
                        this.creatingCompany['street'] = data.sidlo.nazevUlice	|| "";
                        this.creatingCompany['houseNumber'] = data.sidlo.cisloDomovni || "";
                        this.creatingCompany['city'] = data.sidlo.nazevObce || "";
                        this.creatingCompany['postcode'] = data.sidlo.psc || "";
                      }
                    });
                  },
                  error: (err) => {
                    Swal.fire({
                      title: this.l.s("traineeship.alerts.company_found_notFound"),
                      icon: 'error'
                    })
                  }
              });
            break;
                
          }
        }
      })
    );

    this.listeners.push(
      this.traineeship.diaryWeeks
      .subscribe(() => {
        if (!this.traineeship.selectedCompany) return;
        this.weeks = this.traineeship.getDiaryByCompanyId(this.traineeship.selectedCompany.companyId);
      })
    );

    this.listeners.push(
      this.selectedTab
      .pipe(distinctUntilChanged())
      .subscribe((tab: number) => {
        if (!this.traineeship.selectedCompany || this.traineeship.selectedCompany?.companyId == undefined) return;
        switch (tab) {
          case 2:
            this.http.get(
              `${Config.API_URL}/v1/traineeship/company_rating?companyId=${this.traineeship.selectedCompany.companyId}`,
              { withCredentials: true }
            )
            .subscribe((data) => {
              if ('reviews' in data && Array.isArray(data.reviews)) {
                this.reviews = data.reviews;
              }
              if ('rating' in data) {
                this.traineeship.selectedCompany.rating = data.rating;
              }
            })
            break;
        }
      })
    )

    this.http.get<Scope[]>(
      `${Config.API_URL}/v1/traineeship/scopes`,
      { withCredentials: true }
    )
    .subscribe((data: Scope[]) => {
      this.traineeship.scopes = data;
      data.forEach((scope: Scope) => {
        this.scopes[scope.scopeId] = scope;
      })
      this.tableHead = [];
      this.tableHead.push(
        'traineeship.company_name',
        'traineeship.office_address'
      );

      data.forEach((scope: Scope) => {
        this.tableHead.push(scope.shortcut);
      });

      this.tableHead.push(
        'traineeship.web',
        'traineeship.rate'
      );
    })

  this.modalManager.addModal(
    'edit_company', {
    closeable: true,
    title: 'traineeship.edit_company',
    items: [
      {
        type: 'component',
        component: editCompanyModalComponent
      }
    ]
  });

  this.modalManager.addModal(
    'select_company', {
      closeable: true,
      title: 'traineeship.register_to_company',
      items: [
        {
          type: 'component',
          component: selectCompanyModalComponent
        }
      ]
    }
  )

    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("traineeship:getCompanyInstructors")
    //   .subscribe((data: { personId: number }[]) => {
    //     this.traineeship.instructors = [];
    //     data.forEach((person: { personId: number }) => {
    //       this.traineeship.instructors.push(person.personId);
    //     });
    //   })
    // );

    this.listeners.push(
      this.route.params.subscribe(() => {
        this.refreshSelectedCompany()
      })
    );

    // this.listeners.push(
    //   this.selectedCompanyListOption.subscribe(() => {
    //     if (!this.datalist) return;
    //     setTimeout(() => this.datalist?.loadData(), 100);
    //   })
    // );

    this.http.get(
      `${Config.API_URL}/v1/traineeship/companies?limit=0&offset=0`,
      {
        withCredentials: true
      }
    )
    .subscribe((data: any) => {
      if ('error' in data) return;
      let companiesList: Data[][] = []
      data.data.forEach((company: any) => {
        let scopeList: any = {};
        Object.values(JSON.parse(company.scopes)).forEach((value: Scope | any) => {
          scopeList[value.scopeId] = value.status;
        });

        let row: Data[] = [
          { id: company.companyId },
          { value: company.name, isLocale: false },
          { value: Utils.formatAddress({
            code2: company.code2,
            street: company.street,
            houseNumber: company.houseNumber,
            city: company.cityName,
            postcode: company.postcode
          }), isLocale: false },
        ];

        Object.keys(JSON.parse(JSON.stringify(this.scopes))).forEach((scopeId: string) => {
          row.push({ value: scopeList[scopeId] ? '✅' : '❌', isLocale: false })
        });
        
        row.push(
          { value: Utils.formatWeb(company.web), isLocale: false },
          { value: this.traineeship.getRating(company), isLocale: company.rating ? false : true }
        );
        companiesList.push(row);
        
      })
      this.metadata.rows = data.rows;
      this.companies.next(companiesList);
    });

    // this.listeners.push(
    //   this.schoolingo.socketService.addFunction("traineeship:selectCompany")
    //   .subscribe((data: selectCompanyAPI | errorAPI) => {
    //     if ('error' in data) {
    //       switch(data.error) {
    //         case "too_many_students_in_company":
    //           this.alert = 'too_many_students_in_company';
    //           break;
    //       }
    //       return;
    //     }

    //     if ('status' in data) {
    //       this.requestDataForAlert = data;

    //       let weekList = this.traineeship.diaryWeeks.getValue();
    //       weekList.forEach((week: DiaryWeek) => {
    //         if (week.traineeship === data.traineeship) {
    //           week.company = data.company;
    //           week.instructor = data.instructor;
    //         }
    //       });

    //       this.traineeship.diaryWeeks.next(weekList);

    //       if (data.status == 'success') {
    //         this.alert = 'success_selected_company';
    //       }

    //       if (data.status == 'updated') {
    //         this.alert = 'success_updated_instructor';
    //       }
    //     }
    //   })
    // );
  }

  public getAllScopes(): Scope[] {
    return Object.values(JSON.parse(JSON.stringify(this.scopes)));
  }

  public getScopes(company: any): string[] {
    let scopeList: string[] = [];
    if (!company || !company.scopes) return [];
    Object.values<Scope>(JSON.parse(company.scopes)).forEach((value) => {
      if (this.scopes?.[value.scopeId] && value.status == true) {
        scopeList.push(this.scopes?.[value.scopeId]?.name)
      }
    });
    return scopeList;
  }

  public checkIfCompanyIsSuitableForMe(): boolean {
    let company = this.traineeship.selectedCompany;
    if (!company || !company.scopes) return false;
    let user = this.auth.getUser();
    if (!user || user.role != "student" || !user.classes.length || !user.classes[0].scopeId) return false;
    let scopeId = user.classes[0].scopeId;
    let scopes = Object.values<Scope>(JSON.parse(company.scopes)).filter((value: Scope) => value.scopeId === scopeId);
    if (scopes.length == 0) return false;
    return true;
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  options = {
    theme: (this.t.getTheme().getValue() == "light") ? 'ag-default' : 'ag-default-dark',
    background: {
      visible: false
    },
    minHeight: 250,
    // Data: Data to be displayed in the chart
    data: [
      { year: "2020", students: 15 },
      { year: "2021", students: 10 },
      { year: "2022", students: 8 },
      { year: "2023", students: 12 },
      { year: "2024", students: 15 },
    ],

    axes: [
      {
        type: 'category',
        position: "bottom"
      },
      {
        type: "number",
        position: "left",
        min: 0
      },
    ],
  
    // Series: Defines which chart type and data to use
    series: [
      {
        type: "line",
        xKey: "year",
        yKey: "students",
        yName: "Počet studentů"
      },
    ],
  };
}
