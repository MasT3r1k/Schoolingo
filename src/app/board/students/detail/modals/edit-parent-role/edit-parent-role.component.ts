import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ParentInfo } from '../../../students.component';
import { CheckboxComponent } from '@Components/Checkbox';

@Component({
  selector: 'app-edit-parent-role',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CheckboxComponent],
  templateUrl: './edit-parent-role.component.html',
  styleUrl: './edit-parent-role.component.css'
})
export class EditParentRoleComponent implements OnInit {
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  
  public parent!: ParentInfo;
  public student_id!: number;
  
  public roles = ['father', 'mother', 'other'];

  public form = {
    role: 'father',
    legal_guardian_de_jure: false,
    closest_legal_representative: false,
    allowed_to_receive_information: false
  };

  ngOnInit(): void {
    const data = this.modalManager.getModalData('edit_parent_role');
    this.parent = data.parent;
    this.student_id = data.student_id;
    
    this.form = {
      role: this.parent.relationship || 'father',
      legal_guardian_de_jure: !!this.parent.legal_guardian_de_jure,
      closest_legal_representative: !!this.parent.closest_legal_representative,
      allowed_to_receive_information: !!this.parent.allowed_to_receive_information
    };
  }

  public closeModal(): void {
    this.modalManager.closeModal('edit_parent_role');
  }

  public save(): void {
    const payload = {
      role: this.form.role,
      legal_guardian_de_jure: this.form.legal_guardian_de_jure ? 1 : 0,
      closest_legal_representative: this.form.closest_legal_representative ? 1 : 0,
      allowed_to_receive_information: this.form.allowed_to_receive_information ? 1 : 0
    };

    this.http.patch(`${Config.API_URL}/v1/student/${this.student_id}/parent/${this.parent.id}/role`, payload, { withCredentials: true })
      .subscribe((api: any) => {
        if (api.success) {
          const data = this.modalManager.getModalData('edit_parent_role');
          if (data.callback) data.callback();
          this.closeModal();
        }
      });
  }
}
