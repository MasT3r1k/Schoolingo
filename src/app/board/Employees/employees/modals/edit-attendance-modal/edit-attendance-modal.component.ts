import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownManager } from '@Schoolingo/dropdown';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-edit-attendance-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './edit-attendance-modal.component.html',
  styleUrls: ['./edit-attendance-modal.component.css']
})
export class EditAttendanceModalComponent {
  modalManager = inject(ModalManager);
  dropdownManager = inject(DropdownManager);
  http = inject(HttpClient);
  
  data: any;
  isLoading = false;
  success = false;
  error: string | null = null;
  
  attendance: any = {
    attendanceId: 0,
    checkIn: '',
    checkOut: '',
    breakMinutes: 0,
    workedMinutes: 0,
    type: 'regular',
    notes: '',
    approved: false
  };

  types = [
    { id: 'office', name: 'Kancelář' },
    { id: 'home_office', name: 'Home Office' },
    { id: 'trip', name: 'Služební cesta' },
    { id: 'doctor', name: 'Lékař' },
    { id: 'other', name: 'Jiné' }
  ];

  ngOnInit() {
    this.data = this.modalManager.getModalData('edit_attendance');
    if (this.data && this.data.record) {
      this.attendance = { 
        ...this.data.record,
        checkIn: this.data.record.check_in || null,
        checkOut: this.data.record.check_out || null,
        breakMinutes: this.data.record.break_minutes || 0,
        workedMinutes: this.data.record.worked_winutes || 0,
        notes: this.data.record.notes || '',
        approved: this.data.record.approved || false,

      };
      
      // Ensure checkIn/checkOut are in HH:MM format
      if (this.attendance.checkIn && this.attendance.checkIn.length > 5) {
        this.attendance.checkIn = this.attendance.checkIn.substring(0, 5);
      }
      if (this.attendance.checkOut && this.attendance.checkOut.length > 5) {
        this.attendance.checkOut = this.attendance.checkOut.substring(0, 5);
      }
    }
  }

  save() {
    this.isLoading = true;
    this.error = null;
    
    // Auto-calculate worked minutes if checkIn and checkOut are present
    if (this.attendance.checkIn && this.attendance.checkOut) {
      const start = this.parseTime(this.attendance.checkIn);
      const end = this.parseTime(this.attendance.checkOut);
      const totalMinutes = end - start;
      const worked = Math.max(0, totalMinutes - (this.attendance.breakMinutes || 0));
      this.attendance.workedMinutes = worked;
    }

    const isNew = !this.attendance.attendance_id || this.attendance.attendance_id === 0;
    const url = isNew 
      ? `${Config.API_URL}/v1/employees/${this.attendance.teacher_id}/attendance`
      : `${Config.API_URL}/v1/employees/${this.attendance.teacher_id}/attendance/${this.attendance.attendance_id}`;
    
    const request = isNew
      ? this.http.post(url, this.attendance, { withCredentials: true })
      : this.http.put(url, this.attendance, { withCredentials: true });

    request.pipe(
      catchError(err => {
        console.error(err);
        this.error = 'Nepodařilo se uložit změny.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((res: any) => {
      if (res && res.success) {
        this.success = true;
        
        // Refresh data in parent component
        if (this.data.onSave) {
          this.data.onSave();
        }
        
        setTimeout(() => {
            this.modalManager.closeModal('edit_attendance');
        }, 1000);
      } else if (!this.error) {
           this.error = 'Nastala neznámá chyba.';
           this.isLoading = false;
      }
    });
  }

  close() {
    this.modalManager.closeModal('edit_attendance');
  }

  public selectedType() {
    return this.types.find(t => t.id == this.attendance.type) || this.types[0];
  }
  
  parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
