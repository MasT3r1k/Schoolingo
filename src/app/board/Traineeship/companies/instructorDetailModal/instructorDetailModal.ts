
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Traineeship } from '@Schoolingo/traineeship';
import { Permission } from '@Schoolingo/permission';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-instructor-detail-modal',
  templateUrl: './instructorDetailModal.html',
  styleUrls: ['./instructorDetailModal.css', '../../../../Components/modal/modal.css'],
  imports: [CommonModule, FormsModule, IconsModule]
})
export class instructorDetailModalComponent implements OnInit {
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public traineeship = inject(Traineeship);
  public l = inject(Locale);
  public Utils = Utils;
  public permissions = inject(Permission);

  public instructor: any = null;
  public canEdit: boolean = false;
  public isEditMode: boolean = false;
  public editData: any = {};
  public showStatusDropdown: boolean = false;

  constructor() {}

  ngOnInit() {
    this.instructor = this.traineeship.selectedInstructor;
    // Check permissions - assuming similar logic to company edit
    // Or check if user is the instructor (if applicable)
    this.canEdit = this.permissions.checkPermission(["manager:traineeship:editCompany", "manager:traineeship:manage"]); 
  }

  toggleEdit() {
    this.isEditMode = true;
    this.editData = { ...this.instructor };
    
    // Split name into first/last if needed or use existing fields
    if (!this.editData.firstname && this.editData.name) {
        const parts = this.editData.name.split(' ');
        this.editData.firstname = parts[0];
        this.editData.lastname = parts.slice(1).join(' ');
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editData = {};
  }

  saveInstructor() {
    this.http.post(
      `${Config.API_URL}/v1/traineeship/instructor_update`,
      {
        instructorId: this.editData.instructorId,
        firstname: this.editData.firstname,
        lastname: this.editData.lastname,
        email: this.editData.email,
        phone: this.editData.phone,
        role: this.editData.role,
        status: this.editData.status
      },
      { withCredentials: true }
    ).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          // Update local data
          this.instructor.name = `${this.editData.firstname} ${this.editData.lastname}`;
          this.instructor.firstname = this.editData.firstname;
          this.instructor.lastname = this.editData.lastname;
          this.instructor.email = this.editData.email;
          this.instructor.phone = this.editData.phone;
          this.instructor.role = this.editData.role;
          this.instructor.status = this.editData.status;


          // Update in main list if possible
          if (this.traineeship.selectedCompany && this.traineeship.selectedCompany.instructors) {
             const idx = this.traineeship.selectedCompany.instructors.findIndex((i: any) => i.instructorId === this.instructor.instructorId);
             if (idx !== -1) {
               this.traineeship.selectedCompany.instructors[idx] = { ...this.instructor };
             }
          }

          this.isEditMode = false;
          Swal.fire({
            icon: 'success',
            title: this.l.s('traineeship.alerts.success_updated_instructor'),
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: this.l.s('traineeship.alerts.save_error_title'),
            text: res.error || 'Unknown error'
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: this.l.s('traineeship.alerts.save_error_title'),
          text: err.message || 'Error occurred'
        });
      }
    });
  }

  closeModal() {
    this.modalManager.closeModal('instructor_detail');
  }

  toggleStatusDropdown(event: Event) {
      event.stopPropagation();
      this.showStatusDropdown = !this.showStatusDropdown;
  }

  selectStatus(status: string) {
      this.editData.status = status;
      this.editData.status_translated = this.l.s('traineeship.status_instructor.' + status);
      this.showStatusDropdown = false;
  }
}
