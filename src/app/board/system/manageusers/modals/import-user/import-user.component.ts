import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';

export interface LDAPUser {
  username: string;
  fullName: string;
  email: string;
  upn: string;
  groups: string[];
  selected?: boolean;
  role?: string;
  first_name?: string;
  last_name?: string;
}

@Component({
  selector: 'app-import-user',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './import-user.component.html',
  styleUrl: './import-user.component.css'
})
export class ImportUserComponent implements OnInit {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

  isLoading = true;
  isImporting = false;
  error: string | null = null;
  users: LDAPUser[] = [];
  
  // Select all checkbox
  selectAll = false;

  get selectedUsers(): LDAPUser[] {
    return this.users.filter(u => u.selected);
  }

  ngOnInit() {
    this.fetchUnimportedUsers();
  }

  fetchUnimportedUsers() {
    this.isLoading = true;
    this.error = null;
    this.http.get<any>(`${Config.API_URL}/v1/system/users/ldap_unimported`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.data.map((u: LDAPUser) => {
              // Parse full name to first and last name loosely
              let firstName = u.fullName || u.username;
              let lastName = '';
              const parts = (u.fullName || '').split(' ');
              if (parts.length > 1) {
                lastName = parts.pop() || '';
                firstName = parts.join(' ');
              }
              
              return {
                ...u,
                selected: false,
                role: 'student',
                first_name: firstName,
                last_name: lastName
              };
            });
          } else {
            this.error = response.error || 'Nepodařilo se načíst uživatele.';
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err?.error?.error || 'Došlo k chybě při komunikaci se serverem.';
          this.isLoading = false;
        }
      });
  }

  toggleSelectAll() {
    this.users.forEach(u => u.selected = this.selectAll);
  }
  
  checkSelectAll() {
    this.selectAll = this.users.every(u => u.selected) && this.users.length > 0;
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrátor';
      case 'teacher': return 'Učitel';
      case 'student': return 'Student';
      case 'parent': return 'Rodič';
      default: return role;
    }
  }

  setRoleForSelected(role: string) {
    this.users.filter(u => u.selected).forEach(u => u.role = role);
    this.dropdownManager.selected_dropdown = '';
  }

  importSelected() {
    const toImport = this.selectedUsers.map(u => ({
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role
    }));

    if (toImport.length === 0) return;

    this.isImporting = true;
    this.error = null;

    this.http.post<any>(`${Config.API_URL}/v1/system/users/ldap_import`, { users: toImport }, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.modalManager.closeModal('import_user');
            // Optional: trigger reload of user list in the parent component
            window.location.reload(); // Quick workaround to refresh the list
          } else {
            this.error = response.error || 'Nastala chyba při importu.';
          }
          this.isImporting = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Došlo k chybě při importu.';
          this.isImporting = false;
        }
      });
  }
}
