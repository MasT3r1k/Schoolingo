import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { MessageManager, messageReceiver } from '@Schoolingo/messages';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

interface RecipientGroup {
  group: string;
  label: string;
  users: messageReceiver[];
  expanded?: boolean;
}

@Component({
  selector: 'app-select-receiver',
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './select-receiver.component.html',
  styleUrl: './select-receiver.component.css'
})
export class SelectReceiverComponent implements OnInit {
  private http = inject(HttpClient);
  public messageManager = inject(MessageManager);
  public dropdownManager = inject(DropdownManager);

  public availableGroups: RecipientGroup[] = [];
  public selectedReceivers: messageReceiver[] = [];
  public searchText = '';
  public selectedCategory: RecipientGroup | null = null;
  public l = inject(Locale);

  ngOnInit() {
    this.selectedReceivers = [...this.messageManager.selectedReceivers$.getValue()];
    this.loadRecipients();
  }

  loadRecipients() {
    this.http.post<RecipientGroup[]>(`${Config.API_URL}/v1/messages/recipients`, { 
        message_type: this.messageManager.messageType.getValue() 
    }, { withCredentials: true }).subscribe({
      next: (groups) => {
        this.availableGroups = groups.map(g => ({ ...g, expanded: true }));
        if (this.availableGroups.length > 0) {
            this.selectedCategory = this.availableGroups[0];
        }
      },
      error: (e) => console.error(e)
    });
  }

  selectCategory(group: RecipientGroup) {
      this.selectedCategory = group;
  }

  toggleGroup(group: RecipientGroup) {
    group.expanded = !group.expanded;
  }

  isSelected(receiver: messageReceiver): boolean {
      return this.selectedReceivers.some(r => r.person_id === receiver.person_id);
  }

  toggleRecipient(receiver: messageReceiver) {
    const index = this.selectedReceivers.findIndex(r => r.person_id === receiver.person_id);
    if (index > -1) {
      this.selectedReceivers.splice(index, 1);
    } else {
      this.selectedReceivers.push(receiver);
    }
    this.updateGlobalState();
  }

  removeRecipient(receiver: messageReceiver) {
    const index = this.selectedReceivers.findIndex(r => r.person_id === receiver.person_id);
    if (index > -1) {
      this.selectedReceivers.splice(index, 1);
      this.updateGlobalState();
    }
  }

  selectAllInGroup(group: RecipientGroup) {
      group.users.forEach(u => {
          if (!this.isSelected(u)) {
              this.selectedReceivers.push(u);
          }
      });
      this.updateGlobalState();
  }

  deselectAllInGroup(group: RecipientGroup) {
      group.users.forEach(u => {
           const idx = this.selectedReceivers.findIndex(r => r.person_id === u.person_id);
           if (idx > -1) this.selectedReceivers.splice(idx, 1);
      });
      this.updateGlobalState();
  }

  updateGlobalState() {
      this.messageManager.selectedReceivers$.next(this.selectedReceivers);
  }

  getTotalFilteredUsers(): number {
      return this.getFilteredGroups().reduce((acc, g) => acc + g.users.length, 0);
  }

  getFilteredGroups() {
      if (!this.searchText) return this.availableGroups;
      const lowerSearch = this.searchText.toLowerCase();
      return this.availableGroups.filter(g => 
          g.label.toLowerCase().includes(lowerSearch) ||
          g.users.some(u => 
              u.full_name.toLowerCase().includes(lowerSearch) || 
              (u.role && u.role.toLowerCase().includes(lowerSearch))
          )
      );
  }

  getUsersInCategory() {
      if (!this.selectedCategory) return [];
      if (!this.searchText) return this.selectedCategory.users;
      const lowerSearch = this.searchText.toLowerCase();
      return this.selectedCategory.users.filter(u => 
          u.full_name.toLowerCase().includes(lowerSearch) || 
          (u.role && u.role.toLowerCase().includes(lowerSearch))
      );
  }

  addAllInCategory() {
      if (!this.selectedCategory) return;
      this.getUsersInCategory().forEach(u => {
          if (!this.isSelected(u)) {
              this.selectedReceivers.push(u);
          }
      });
      this.updateGlobalState();
  }

  removeAllSelected() {
      this.selectedReceivers = [];
      this.updateGlobalState();
  }
}
