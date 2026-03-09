import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Documents, DocumentPermission } from '@Schoolingo/documents';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent implements OnInit {
  public l = inject(Locale);
  public documents = inject(Documents);
  public modalManager = inject(ModalManager);

  public permissions: DocumentPermission[] = [];
  public availableRoles: any[] = [];
  public availableUsers: any[] = [];
  public loading = true;

  public selectedType: 'role' | 'user' = 'role';
  public selectedId: string = '';
  public selectedPerm: 'READ' | 'WRITE' | 'DENY' = 'READ';

  ngOnInit() {
    const file = this.documents.getSelectedFile();
    if (!file || file.document_id === null) return;

    this.documents.getPermissions(file.document_id).subscribe(perms => {
      this.permissions = perms.map(p => {
        if (p.role_id === 0) p.role_name = this.l.s('documents.everyone');
        return p;
      });
      this.loading = false;
    });

    this.documents.getPermissionOptions().subscribe(options => {
      this.availableRoles = options.roles.map(r => {
        if (r.role_name === '_EVERYONE_') r.role_name = this.l.s('documents.everyone');
        return r;
      });
      this.availableUsers = options.users;
    });
  }

  addPermission() {
    if (this.selectedId === '') return;

    const id = Number(this.selectedId);

    const exists = this.permissions.find(p => 
        (this.selectedType === 'role' && p.role_id === id) ||
        (this.selectedType === 'user' && p.user_id === id)
    );

    if (exists) {
        exists.permission_type = this.selectedPerm;
    } else {
        const newPerm: DocumentPermission = {
            role_id: this.selectedType === 'role' ? id : null,
            user_id: this.selectedType === 'user' ? id : null,
            permission_type: this.selectedPerm,
            role_name: this.selectedType === 'role' ? (id === 0 ? this.l.s('documents.everyone') : this.availableRoles.find(r => r.role_id === id)?.role_name) : undefined,
            username: this.selectedType === 'user' ? this.availableUsers.find(u => u.user_id === id)?.username : undefined,
            first_name: this.selectedType === 'user' ? this.availableUsers.find(u => u.user_id === id)?.first_name : undefined,
            last_name: this.selectedType === 'user' ? this.availableUsers.find(u => u.user_id === id)?.last_name : undefined,
        };
        this.permissions.push(newPerm);
    }
    this.selectedId = '';
  }

  removePermission(index: number) {
    this.permissions.splice(index, 1);
  }

  save() {
    const file = this.documents.getSelectedFile();
    if (!file || file.document_id === null) return;

    this.documents.setPermissions(file.document_id, this.permissions).subscribe(() => {
        this.modalManager.closeModal('manage_permissions');
    });
  }
}
