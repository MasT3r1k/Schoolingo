import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  selector: 'app-add-class',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.css']
})
export class AddClassComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

  public addClassTab: 'manual' | 'import' = 'manual';

  public availableScopes: { id: number; name: string }[] = [];
  public availableTeachers: { id: number; firstName: string; lastName: string }[] = [];
  public availableRooms: { id: number; name: string }[] = [];

  public newClass = {
    name: '',
    year: 1,
    scopeId: null as number | null,
    headTeacherId: null as number | null,
    classroomId: null as number | null
  };

  ngOnInit() {
    this.loadFilters();
  }

  loadFilters() {
    // Attempting to fetch metadata
    this.http.get<{ scopes: any[], teachers: any[], rooms: any[] }>(
        `${Config.API_URL}/v1/school/classes/metadata`,
        { withCredentials: true }
    ).subscribe({
        next: (response) => {
            this.availableScopes = response.scopes || [];
            this.availableTeachers = response.teachers || [];
            this.availableRooms = response.rooms || [];
        },
        error: (error) => {
            console.error('Error loading config for adding class:', error);
            alert('Nastala chyba při načítání dat z databáze (předmět, učitelé, učebny).');
        }
    });
  }

  setAddClassTab(tab: typeof this.addClassTab) {
    this.addClassTab = tab;
  }

  public selectedScope() {
    return (this.newClass.scopeId ? (this.availableScopes.find(s => s.id === this.newClass.scopeId)?.name || 'Vyberte obor') : 'Vyberte obor')
  }

  public selectedTeacher() {
    const t = this.availableTeachers.find(t => t.id === this.newClass.headTeacherId);
    return t ? `${t.firstName} ${t.lastName}` : 'Vyberte třídního učitele';
  }

  public selectedRoom() {
    return (this.newClass.classroomId ? (this.availableRooms.find(r => r.id === this.newClass.classroomId)?.name || 'Vyberte kmenovou učebnu') : 'Vyberte kmenovou učebnu')
  }

  submit() {
    if (this.addClassTab === 'manual') {
        if (!this.newClass.name || !this.newClass.year || !this.newClass.scopeId) {
            alert('Vyplňte prosím název, ročník a obor třídy.');
            return;
        }

        this.http.post(`${Config.API_URL}/v1/school/classes`, this.newClass, { withCredentials: true }).subscribe({
            next: () => {
                this.close();
                alert('Třída byla úspěšně vytvořena.');
                window.location.reload();
            },
            error: (err) => {
                console.error('Failed to add class:', err);
                const msg = err.error?.error || 'Nepodařilo se vytvořit třídu.';
                alert('Chyba: ' + msg);
            }
        });
    } else {
        alert('Funkce importu není v tuto chvíli implementována.');
    }
  }

  close() {
    this.modalManager.closeModal('add_class');
  }
}
