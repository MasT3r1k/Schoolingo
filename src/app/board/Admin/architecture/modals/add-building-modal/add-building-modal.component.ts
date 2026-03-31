import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  selector: 'add-building-modal',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './add-building-modal.component.html',
  styleUrls: ['./add-building-modal.component.css']
})
export class AddBuildingModalComponent {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public buildingId: number | null = null;

  public selected_type: string = 'school';

  public buildingTypes = [
    { value: 'school', label: 'Škola' },
    { value: 'canteen', label: 'Jídelna' },
    { value: 'workshop', label: 'Dílna' },
    { value: 'other', label: 'Ostatní' }
  ];

  public buildingForm = {
    name: ''
  };

  ngOnInit(): void {
    const data = this.modalManager.getModalData('add-building');
    if (data?.building) {
      this.buildingId = data.building.building_id;
      this.buildingForm.name = data.building.name;
      this.selected_type = data.building.type;
    }
  }

  public getSelectedTypeLabel(): string {
    const type = this.buildingTypes.find(t => t.value === this.selected_type);
    return type ? type.label : 'Vyberte typ';
  }

  public saveBuilding(): void {
    const payload = {
      building_id: this.buildingId !== null ? this.buildingId : undefined,
      name: this.buildingForm.name,
      type: this.selected_type
    };

    this.http.post(`${Config.API_URL}/v1/school/architecture/buildings`, payload, { withCredentials: true })
      .subscribe(() => {
        const modalData = this.modalManager.getModalData('add-building');
        if (modalData?.refreshCallback) {
          modalData.refreshCallback();
        }
        this.modalManager.closeModal('add-building');
      });
  }

  public closeModal(): void {
    this.modalManager.closeModal('add-building');
  }
}