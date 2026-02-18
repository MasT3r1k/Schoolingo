import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Config } from '../infrastructure/config';
import { Locale } from '@Schoolingo/locale';
import { Theme } from '@Schoolingo/theme';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Country } from 'country-state-city';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.css'
})
export class SetupComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  public l = inject(Locale);
  public t = inject(Theme);
  public dropdownManager = inject(DropdownManager);
  public Config = Config;
  public countryManager = Country;
  
  public countries: any[] = [];
  public districts: any[] = [];
  public supportedAresCountries: string[] = ['CZ'];
  
  public step = 1;
  public loading = false;
  public aresLoading = false;
  public error: string | null = null;
  public aresError: string | null = null;

  public schoolSearchLoading = false;
  public schoolSearchResults: any[] = [];
  public schoolSearchStart = 0;
  public schoolSearchHasMore = true;
  public schoolSearchQuery = '';
  private schoolSearchSubject = new Subject<string>();

  public availableBranches: any[] = [];
  public branchesLoading = false;

  constructor() {
    this.setupForm.get('ico')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      // Allow only numbers
      if (value && /[^0-9]/.test(value)) {
        this.setupForm.patchValue({ ico: value.replace(/[^0-9]/g, '') }, { emitEvent: false });
        return;
      }

      if (value && value.length === 8 && !this.aresLoading && this.isAresSupported()) {
        this.searchAres(value);
      }
    });

    this.schoolSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
        this.schoolSearchQuery = query;
        this.searchSchools(true);
    });

    // Reset ICO if country changes to unsupported
    this.setupForm.get('country')?.valueChanges.subscribe(() => {
        if (!this.isAresSupported()) {
            this.setupForm.patchValue({ ico: '' });
        }
    });
  }

  ngOnInit(): void {
    this.http.get<any>(`${Config.API_URL}/v1/setup/data`)
      .subscribe({
        next: (data) => {
          this.countries = data.countries;
          this.districts = data.districts;
          
          // Set default country to Czech Republic (usually ID 1 if sorted by nationality, but let's be safe)
          const cz = this.countries.find(c => c.code2 === 'CZ');
          if (cz) {
            this.setupForm.patchValue({ country: cz.countryId });
          }

          // Test ISV Search as requested
          this.testIsvSearch('Střední průmyslová');
        }
      });
  }

  public testIsvSearch(query: string) {
    this.http.post<any[]>(`${Config.API_URL}/v1/setup/isv/search`, { query })
      .subscribe({
        next: (data) => {
            console.log('--- ISV Search Results ---');
            if (data && data.length > 0) {
                data.forEach(item => {
                    console.log(`ID: ${item.id}, ICO: ${item.ico}, Název: ${item.nazev}`);
                });
            } else {
                console.log('No schools found via ISV.');
            }
            console.log('--------------------------');
        }
      });
  }

  public setupForm: FormGroup = this.fb.group({
    // Step 1: Identification
    ico: [''],
    manual: [false],

    // Step 2: School Details
    schoolName: ['', Validators.required],
    domain: [window.location.host], 
    street: [''],
    city: [''],
    zip: [''],
    houseNumber: [''],
    orientationNumber: [''],
    districtId: [null],
    country: [null, Validators.required],
    schoolType: ['zakladni'],
    branches: [[]],
    redIzo: [''],
    izo: [''],
    schoolShortName: [''],
    schoolEmail: ['', [Validators.email]],
    schoolPhone: [''],
    schoolWeb: [''],
    databox: [''],
    director: [''],
    // details: [''],
    
    // Step 3: Admin
    adminFirstName: ['', Validators.required],
    adminLastName: ['', Validators.required],
    adminUsername: ['', Validators.required],
    adminPassword: ['', [Validators.required, Validators.minLength(5)]],
    adminEmail: ['', [Validators.email]],

    // Step 4: Login Settings
    auth_classic: [true],
    auth_ldap: [false],
    auth_qr: [false],
    auth_passkeys: [false]
  });

  public schoolTypes = [
    { value: 'zakladni', label: 'Základní škola' },
    { value: 'stredni', label: 'Střední škola' },
    { value: 'gymnazium', label: 'Gymnázium' },
    { value: 'sos', label: 'SOŠ' },
    { value: 'sps', label: 'SPŠ' },
    { value: 'sou', label: 'SOU' },
    { value: 'vysoka', label: 'Vysoká škola' },
    { value: 'skolka', label: 'Mateřská škola' },
    { value: 'zus', label: 'ZUŠ' }
  ];

  public isAresSupported(): boolean {
      const country = this.getSelectedCountry();
      return country && this.supportedAresCountries.includes(country.code2);
  }

  public searchAres(val: string | null = null) {
    const ico = val || this.setupForm.get('ico')?.value;
    if (!ico || ico.length < 8) {
      if (!val) this.aresError = 'Neplatné IČO';
      return;
    }
    this.supplementSchoolData(ico);
  }

  public supplementSchoolData(ico: string) {
      const country = this.getSelectedCountry();
      if (!country) return;

      switch(country.code2) {
          case 'CZ':
              this.fetchAresData(ico);
              break;
          // Space for other countries
          default:
              console.warn(`No supplement provider for ${country.code2}`);
      }
  }

  public fetchAresData(ico: string) {
    this.aresLoading = true;
    this.aresError = null;

    this.http.get<any>(`${Config.API_URL}/v1/setup/ares/${ico}`)
      .subscribe({
        next: (data) => {
          this.aresLoading = false;
          if (!data) {
            this.aresError = 'Škola nebyla nalezena v ARES';
            return;
          }
          this.applyAresData(data);
          this.nextStep();
        },
        error: (err) => {
          this.aresLoading = false;
          this.aresError = 'Chyba při komunikaci s ARES';
          console.error(err);
        }
      });
  }

  public onSchoolSearch(query: string) {
      this.schoolSearchQuery = query;
      this.schoolSearchSubject.next(query);
  }

  public searchSchools(reset: boolean = false) {
    if (reset) {
        this.schoolSearchStart = 0;
        this.schoolSearchResults = [];
        this.schoolSearchHasMore = true;
    }

    if (this.schoolSearchLoading || !this.schoolSearchHasMore || !this.schoolSearchQuery) return;

    this.schoolSearchLoading = true;
    this.http.post<any[]>(`${Config.API_URL}/v1/setup/search`, {
        query: this.schoolSearchQuery,
        start: this.schoolSearchStart,
        count: 20
    }).subscribe({
        next: (data) => {
            this.schoolSearchLoading = false;
            if (!data || data.length === 0) {
                this.schoolSearchHasMore = false;
                return;
            }
            this.schoolSearchResults = [...this.schoolSearchResults, ...data];
            this.schoolSearchStart += data.length;
            if (data.length < 20) this.schoolSearchHasMore = false;
        },
        error: () => {
            this.schoolSearchLoading = false;
        }
    });
  }

  public onSchoolScroll(event: any) {
      const element = event.target;
      if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
          this.searchSchools();
      }
  }

  public selectSchool(school: any) {
      console.log('Selected school info:', school);
      this.dropdownManager.selected_dropdown = '';
      
      this.aresLoading = true;
      this.branchesLoading = true;

      const ico = school.ico || school.icoId;
      
      // 1. Fetch from ARES for basic address + type autodetection
      this.http.get<any>(`${Config.API_URL}/v1/setup/ares/${ico}`)
        .subscribe({
            next: (data) => {
                this.aresLoading = false;
                this.setupForm.patchValue({ ico: ico });
                this.applyAresData(data);
                
                // 2. Fetch from ISV for branches if needed
                this.fetchIsvDetails(school.ico);
            },
            error: () => {
                this.aresLoading = false;
                this.branchesLoading = false;
                this.setupForm.patchValue({ 
                    ico: school.ico,
                    schoolName: school.obchodniJmeno
                });
                this.nextStep();
            }
        });
  }

  public fetchIsvDetails(ico: string) {
      this.availableBranches = [];
      this.http.post<any[]>(`${Config.API_URL}/v1/setup/isv/search`, { query: ico })
        .subscribe({
            next: (data) => {
                this.branchesLoading = false;
                if (data && data.length > 0) {
                    const school = data.find((s: any) => s.ico === ico) || data[0];
                    
                    // Populate basic info from ISV
                    this.setupForm.patchValue({
                        redIzo: school.redIzo || '',
                        schoolEmail: school.kontakty?.find((k: any) => k.typ === 'EMAIL')?.kontakt || '',
                        schoolPhone: school.kontakty?.find((k: any) => k.typ === 'TELEFON')?.kontakt || '',
                        schoolWeb: school.kontakty?.find((k: any) => k.typ === 'WWW')?.kontakt || '',
                        databox: school.kontakty?.find((k: any) => k.typ === 'DATOVA_SCHRANKA')?.kontakt || ''
                    });

                    if (school.skoly) {
                        const branches: any[] = [];
                        
                        // Set primary IZO if available
                        if (school.skoly.length > 0) {
                            this.setupForm.patchValue({ izo: school.skoly[0].izo || '' });
                        }

                        school.skoly.forEach((s: any) => {
                            if (s.obory) {
                                s.obory.forEach((obor: any) => {
                                    if (obor.platnost === 'PLATNE') {
                                        branches.push({
                                            id: obor.id,
                                            code: obor.kodOboru,
                                            name: obor.nazevOboru,
                                            type: s.druhSkolyNazev
                                        });
                                    }
                                });
                            }
                        });
                        this.availableBranches = branches;
                    }
                }
                this.nextStep();
            },
            error: () => {
                this.branchesLoading = false;
                this.nextStep();
            }
        });
  }

  public applyAresData(data: any) {
      let schoolType = 'zakladni';
      const nameLower = data.name.toLowerCase();
      const nace = data.czNace || [];
      
      // First try NACE codes for more precise classification
      if (nace.includes('85100')) schoolType = 'skolka';
      else if (nace.includes('85200')) schoolType = 'zakladni';
      else if (nace.includes('85410') || nace.includes('85420')) schoolType = 'vysoka'; // Post-secondary non-tertiary & Tertiary
      else if (nace.includes('85520')) schoolType = 'zus'; // Cultural education
      else if (nace.includes('85310')) schoolType = 'gymnazium'; // General secondary
      else if (nace.includes('85320')) { 
         // Technical secondary - differentiate by name if possible, otherwise generic secondary
         if (nameLower.includes('střední odborná') || nameLower.includes('soš')) schoolType = 'sos';
         else if (nameLower.includes('střední průmyslová') || nameLower.includes('spš')) schoolType = 'sps';
         else if (nameLower.includes('učiliště') || nameLower.includes('sou')) schoolType = 'sou';
         else schoolType = 'stredni';
      }
      // Fallback to name-based detection if NACE is ambiguous or missing
      else {
          if (nameLower.includes('mateřská') || nameLower.includes('mš ')) schoolType = 'skolka';
          else if (nameLower.includes('gymnázium') || nameLower.includes('gymnazium')) schoolType = 'gymnazium';
          else if (nameLower.includes('střední') || nameLower.includes('sš ') || nameLower.includes('soš') || nameLower.includes('ou ')) schoolType = 'stredni';
          else if (nameLower.includes('vysoká') || nameLower.includes('univerzita')) schoolType = 'vysoka';
          else if (nameLower.includes('základní umělecká') || nameLower.includes('zuš')) schoolType = 'zus';
          else if (nameLower.includes('střední odborná')) schoolType = 'sos';
          else if (nameLower.includes('střední průmyslová')) schoolType = 'sps';
          else if (nameLower.includes('odborné učiliště')) schoolType = 'sou';
      }

      // Clean ZIP code (remove spaces)
      let zip = data.zip ? data.zip.toString().replace(/\s/g, '') : '';

      // Try to find districtId
      let districtId = null;
      const aresDistrict = data.data?.sidlo?.nazevOkresu;
      if (aresDistrict) {
          const found = this.districts.find(d => d.district.toLowerCase() === aresDistrict.toLowerCase());
          if (found) districtId = found.districtId;
      }

      this.setupForm.patchValue({
        schoolName: data.name,
        street: data.street,
        city: data.city,
        zip: zip,
        houseNumber: data.houseNumber?.toString(),
        orientationNumber: data.orientationNumber?.toString(),
        schoolType: schoolType,
        districtId: districtId,
        redIzo: data.redIzo || this.setupForm.get('redIzo')?.value,
        izo: data.izo || this.setupForm.get('izo')?.value,
        schoolShortName: data.shortName || this.setupForm.get('schoolShortName')?.value,
        schoolEmail: data.email || this.setupForm.get('schoolEmail')?.value,
        schoolWeb: data.web || this.setupForm.get('schoolWeb')?.value,
        director: data.director || this.setupForm.get('director')?.value
      });
  }

  public getCountry(id: number | null) {
      if (!this.countries) return null;
      return this.countries.find(c => c.countryId === id);
  }

  public getSelectedCountry() {
      return this.getCountry(this.setupForm.get('country')?.value);
  }

  public toggleBranch(branch: any) {
    const branches = this.setupForm.get('branches')?.value as any[];
    const index = branches.findIndex(b => b.id === branch.id);
    if (index === -1) {
        branches.push(branch);
    } else {
        branches.splice(index, 1);
    }
    this.setupForm.patchValue({ branches: branches });
  }

  public isBranchSelected(id: any): boolean {
    const branches = this.setupForm.get('branches')?.value as any[];
    return branches ? branches.some(b => b.id === id) : false;
  }

  public getDistrict(id: number | null) {
      if (!this.districts) return null;
      return this.districts.find(d => d.districtId === id);
  }

  public getSelectedDistrict() {
      return this.getDistrict(this.setupForm.get('districtId')?.value);
  }

  public getSelectedAuthMethods(): string[] {
      const methods: string[] = [];
      if (this.setupForm.get('auth_classic')?.value) methods.push('Klasické');
      if (this.setupForm.get('auth_qr')?.value) methods.push('QR kód');
      if (this.setupForm.get('auth_ldap')?.value) methods.push('LDAP');
      if (this.setupForm.get('auth_passkeys')?.value) methods.push('Passkeys');
      return methods;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
    this.step--;
  }

  public onSubmit() {
    if (this.setupForm.invalid) return;

    this.loading = true;
    this.error = null;

    const formData = this.setupForm.value;
    
    // Construct payload ensuring domain is correct
    const payload = {
        ...formData,
        domain: window.location.host
    };

    this.http.post(`${Config.API_URL}/v1/setup/install`, payload)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            window.location.href = '/login';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || 'Instalace selhala';
        }
      });
  }
}
