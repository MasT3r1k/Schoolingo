import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { MessageManager, messageReceiver } from '@Schoolingo/messages';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RecipientGroup {
  group: string;
  label: string;
  users: messageReceiver[];
  expanded?: boolean;
}

@Component({
  selector: 'app-select-receiver',
  imports: [CommonModule, FormsModule],
  templateUrl: './select-receiver.component.html',
  styleUrl: './select-receiver.component.css'
})
export class SelectReceiverComponent implements OnInit {
  private http = inject(HttpClient);
  public messageManager = inject(MessageManager);

  public availableGroups: RecipientGroup[] = [];
  public selectedReceivers: messageReceiver[] = [];
  public searchText = '';

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
      },
      error: (e) => console.error(e)
    });
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
      // Filter groups based on search text
      // Also, we want to DISPLAY users in the left panel even if selected? 
      // The design usually dims them or shows a checkmark.
      if (!this.searchText) return this.availableGroups;
      const lowerSearch = this.searchText.toLowerCase();
      return this.availableGroups.map(g => ({
          ...g,
          users: g.users.filter(u => 
              u.full_name.toLowerCase().includes(lowerSearch) || 
              (u.role && u.role.toLowerCase().includes(lowerSearch))
          )
      })).filter(g => g.users.length > 0);
  }
}
