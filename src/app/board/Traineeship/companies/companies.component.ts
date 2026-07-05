import { NgClass, NgStyle, NgIf } from '@angular/common';
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
import { DropdownManager } from '@Schoolingo/dropdown';
import { editCompanyModalComponent } from './editCompanyModal/editCompanyModal';
import { selectCompanyModalComponent } from './selectCompanyModal/selectCompanyModal';
import { instructorDetailModalComponent } from './instructorDetailModal/instructorDetailModal';
import { removeCompanyModalComponent } from './removeCompanyModal/removeCompanyModal';
import { CheckboxComponent } from '@Components/Checkbox';

type Scope = {
  scope_id: number;
  scope_name: string;
  scope_shortcut: string;
  status: boolean;
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatalistComponent, TabsComponent, NgClass, NgStyle, IconsModule, NgIf, CheckboxComponent],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  public auth = inject(Authentication);
  private router = inject(Router);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
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
  public requestStep = new BehaviorSubject<number>(0);

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

  public creatingCompany: any = {
    name: "",
    ico: "",
    dic: "",
    vatId: "",
    street: "",
    houseNumber: "",
    city: "",
    postcode: "",
    web: "",
    email: "",
    phone: "",
    rp_firstName: "",
    rp_lastName: "",
    contact: "",
    description: "",
    activity: "",
    equipment: "",
    status: "approved"
  };

  public countryCodes = ['CZ'];
  public countryCode = 'CZ';

  public getCountryLabel(code: string): string {
    const countries: {[key: string]: string} = {
      'CZ': '🇨🇿 Česko',
      'SK': '🇸🇰 Slovensko',
      'DE': '🇩🇪 Německo',
      'FR': '🇫🇷 Francie',
      'IT': '🇮🇹 Itálie'
    };
    return countries[code] || code;
  }

  private listeners: Subscription[] = [];
  public companies = new BehaviorSubject<Data[][] | any>([]);
  public weeks: DiaryWeek[] = [];
  public search = new FormControl();
  public dic = new FormControl();
  public iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl("");
  public reviews: any[] = [];

  public scopeSupported: number[] = [];
  public toggleScope(scopeId: number, state: boolean): void {
    if (this.scopeSupported.includes(scopeId) && state == false) {
      this.scopeSupported.splice(this.scopeSupported.indexOf(scopeId), 1);
      return;
    }

    if (!this.scopeSupported.includes(scopeId) && state == true) {
      this.scopeSupported.push(scopeId);
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
    this.creatingCompany = {
      name: "",
      ico: "",
      dic: "",
      vatId: "",
      street: "",
      houseNumber: "",
      city: "",
      postcode: "",
      web: "",
      email: "",
      phone: "",
      rp_firstName: "",
      rp_lastName: "",
      contact: "",
      description: "",
      activity: "",
      equipment: "",
      status: "approved"
    };
    this.scopeSupported = [];
    this.requestStep.next(0);
    this.router.navigate(['/traineeship/companies/new']);
  }

  public submitForm(): void {
    const isAdmin = this.permissions.checkPermission(["manager:traineeship:manage"]);
    
    // Validate mandatory fields
    if (!this.creatingCompany['name'] || !this.creatingCompany['street'] || !this.creatingCompany['city']) {
      Swal.fire({
        title: this.l.s('traineeship.alerts.missing_fields_title'),
        text: this.l.s('traineeship.alerts.missing_fields_description'),
        icon: 'error'
      });
      return;
    }

    const payload = {
      name: this.creatingCompany['name'],
      ico: this.creatingCompany['ico'] || "",
      dic: this.dic.value || "",
      vatId: this.creatingCompany['vatId'] || "",
      web: this.creatingCompany['web'] || null,
      email: this.creatingCompany['email'] || null,
      phone: this.creatingCompany['phone'] || null,
      rp_firstName: this.creatingCompany['rp_firstName'] || null,
      rp_lastName: this.creatingCompany['rp_lastName'] || null,
      contact: this.creatingCompany['contact'] || null,
      description: this.creatingCompany['description'] || null,
      activity: this.creatingCompany['activity'] || null,
      equipment: this.creatingCompany['equipment'] || null,
      status: isAdmin ? this.creatingCompany['status'] : 'request',
      scopes: this.scopeSupported,
      addressOffice: {
        street: this.creatingCompany['street'],
        houseNumber: this.creatingCompany['houseNumber'],
        cityName: this.creatingCompany['city'],
        postcode: this.creatingCompany['postcode'],
        countryCode: this.countryCode
      },
      addressTrainee: null 
    };

    this.http.post(`${Config.API_URL}/v1/traineeship/new_company`, payload, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            Swal.fire({
              title: this.l.s('traineeship.alerts.save_success_title'),
              text: this.l.s('traineeship.alerts.save_success_description'),
              icon: 'success'
            }).then(() => {
              this.goToList();
            });
          } else {
            Swal.fire({
              title: this.l.s('traineeship.alerts.save_error_title'),
              text: this.l.s('traineeship.alerts.' + res.error) || res.error || 'Failed',
              icon: 'error'
            });
          }
        },
        error: (err) => {
          Swal.fire({
            title: this.l.s('traineeship.alerts.save_error_title'),
            text: err.message,
            icon: 'error'
          });
        }
      });
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
    Object.values(this.scopes).forEach((value: Scope) => {
      let id = value.scope_id;
      arr[id + 2] = value.scope_name ?? "";
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
    this.modalManager.openModal('remove_company', {
      company: this.traineeship.selectedCompany,
      callback: (option: number) => {
        const payload = {
          companyId: this.traineeship.selectedCompany.companyId,
          type: option === 0 ? 'archive' : 'delete'
        };

        this.http.post(`${Config.API_URL}/v1/traineeship/remove_company`, payload, { withCredentials: true })
          .subscribe({
            next: (res: any) => {
              if (res.status === 'success') {
                Swal.fire({
                  title: this.l.s('traineeship.alerts.remove_success_title'),
                  text: this.l.s('traineeship.alerts.remove_success_description'),
                  icon: 'success'
                }).then(() => {
                  this.goToList();
                });
              } else {
                Swal.fire({
                  title: this.l.s('traineeship.alerts.remove_error_title'),
                  text: res.error || 'Failed',
                  icon: 'error'
                });
              }
            },
            error: (err) => {
              Swal.fire({
                title: this.l.s('traineeship.alerts.remove_error_title'),
                text: err.message,
                icon: 'error'
              });
            }
          });
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
                      text: this.l.s("traineeship.alerts.company_found_description", { companyName: data.obchodniJmeno }),
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
        this.scopes[scope.scope_id] = scope;
      })
      this.tableHead = [];
      this.tableHead.push(
        'traineeship.company_name',
        'traineeship.office_address'
      );

      data.forEach((scope: Scope) => {
        this.tableHead.push(scope.scope_shortcut);
      });

      this.tableHead.push(
        'traineeship.web',
        'traineeship.rate'
      );

      this.loadCompanies();
    });

  this.modalManager.addModal(
    'edit_company', {
    closeable: true,
    title: 'traineeship.edit_company',
    width: 600,
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

    this.modalManager.addModal(
      'instructor_detail', {
        closeable: true,
        title: 'traineeship.instructor_detail',
        width: 500,
        items: [
          {
            type: 'component',
            component: instructorDetailModalComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'remove_company', {
        closeable: true,
        title: 'traineeship.remove_company',
        icon: 'building-off',
        width: 500,
        items: [
          {
            type: 'component',
            component: removeCompanyModalComponent
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

    this.listeners.push(
      this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadCompanies();
      })
    );

    this.listeners.push(
      this.selectedCompanyListOption.subscribe(() => {
        this.loadCompanies();
      })
    );

    this.loadCompanies();
  }

  public loadCompanies(): void {
    const nameFilter = this.search.value ? `&name=${encodeURIComponent(this.search.value)}` : '';
    const statusIndex = this.selectedCompanyListOption.getValue();
    const status = this.getCompanyListOptions(true)[statusIndex];
    const statusFilter = status ? `&status=${status}` : '';
    this.http.get(
      `${Config.API_URL}/v1/traineeship/companies?limit=0&offset=0${nameFilter}${statusFilter}`,
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
          scopeList[value.scope_id] = value.status;
        });

        let row: Data[] = [
          { id: company.company_id },
          { value: company.name, isLocale: false },
          { value: Utils.formatAddress({
            code2: company.code2,
            street: company.street,
            house_number: company.house_number,
            city: company.city_name,
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
  }

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

  public getAllScopes(): Scope[] {
    return Object.values(JSON.parse(JSON.stringify(this.scopes)));
  }

  public getScopes(company: any): Scope[] {
    let scopeList: Scope[] = [];
    if (!company || !company.scopes) return [];
    Object.values<Scope>(JSON.parse(company.scopes)).forEach((value) => {
      if (this.scopes?.[value.scope_id] && value.status == true) {
        scopeList.push(this.scopes?.[value.scope_id])
      }
    });
    return scopeList;
  }

  public checkIfCompanyIsSuitableForMe(): boolean {
    let company = this.traineeship.selectedCompany;
    if (!company || !company.scopes) return false;
    let user = this.auth.getUser();
    if (!user || user.role != "student" || !user.classes.length || !user.classes[0].scope_id) return false;
    let scopeId = user.classes[0].scope_id;
    let scopes = Object.values<Scope>(JSON.parse(company.scopes)).filter((value: Scope) => value.scope_id === scopeId);
    if (scopes.length == 0) return false;
    return true;
  }

  public checkIfScopeIsSuitableForMe(scopeId: number): boolean {
    let user = this.auth.getUser();
    if (!user || user.role != "student" || !user.classes.length || !user.classes[0].scope_id) return false;
    let userScopeId = user.classes[0].scope_id;
    return userScopeId == scopeId;
  }

  public openInstructorModal(instructor: any): void {
    this.traineeship.selectedInstructor = instructor;
    this.modalManager.openModal('instructor_detail');
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
