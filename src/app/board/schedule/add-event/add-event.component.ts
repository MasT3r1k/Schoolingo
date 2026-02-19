import { Component, inject } from '@angular/core';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-add-event',
  imports: [IconsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);

  public types = [
    'Školní výlet'
  ];
  public selected_type = this.types[0];


  ngOnInit(): void {

  }

  public closeModal(): void {
    this.modalManager.closeModal('schedule_add_event');
  }
}
