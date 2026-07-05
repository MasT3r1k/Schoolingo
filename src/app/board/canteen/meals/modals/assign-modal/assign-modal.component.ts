import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { MoneyPipe } from '../../../../../pipes/money/money.pipe';

@Component({
  selector: 'app-canteen-assign-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  providers: [MoneyPipe],
  templateUrl: './assign-modal.component.html'
})
export class CanteenAssignModalComponent implements OnInit {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public l = inject(Locale);
  private moneyPipe = inject(MoneyPipe)

  public date = '';
  public variantIndex = 1;
  public selectedMealId: number | null = null;
  public limitCount = 0
  public meals: any[] = [];
  public dropdownOptions: { label: string, value: any }[] = [];

  ngOnInit(): void {
    const data = this.modalManager.getModalData('canteen-assign-modal');
    if (data) {
      this.date = data.date;
      this.variantIndex = data.variant_index;
      this.selectedMealId = data.meal_id;
      this.meals = data.meals || [];
      
      this.dropdownOptions = [
        { label: this.l.s('canteen.choose_meal_dropdown'), value: null },
        ...this.meals.map(m => ({
          label: `${m.name} (${this.moneyPipe.transform(m.price)} ${m.calories ? ', ' + m.calories + ' kcal' : ''})`,
          value: m.meal_id
        }))
      ];
    }
  }

  formatDate(d: string): string {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  saveAssign() {
    const payload = {
      date: this.date,
      variant_index: this.variantIndex,
      meal_id: this.selectedMealId
    };

    this.http.post(`${Config.API_URL}/v1/canteen/menu`, payload, { withCredentials: true })
      .subscribe(() => {
        const data = this.modalManager.getModalData('canteen-assign-modal');
        if (data?.refreshCallback) {
          data.refreshCallback();
        }
        this.modalManager.closeModal('canteen-assign-modal');
      });
  }

  closeModal() {
    this.modalManager.closeModal('canteen-assign-modal');
  }
}
