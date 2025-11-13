import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-add-event',
  imports: [IconsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {
  private modalManager = inject(ModalManager);


  ngOnInit(): void {

  }

  public closeModal(): void {
    this.modalManager.closeModal('schedule_add_event');
  }
}
