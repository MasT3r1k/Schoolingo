import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { MessageManager, messageReceiver } from '@Schoolingo/messages';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Alert } from '@Schoolingo/alert';

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
  public modalManager = inject(ModalManager);

  public availableGroups: RecipientGroup[] = [];
  public selectedReceivers: messageReceiver[] = [];
  public searchText = '';
  public selectedCategory: RecipientGroup | null = null;
  public customGroups: { id: number, name: string, members: number[] }[] = [];
  public showGroupSave = false;
  public newGroupName = '';
  public leftTab: 'categories' | 'groups' = 'categories';
  public l = inject(Locale);

  public checkedInLeft = new Set<number>();
  public checkedInRight = new Set<number>();

  public alerts: Record<string, Alert> = {};
  public selectedType: 'category' | 'group' = 'category';
  public selectedGroup: { id: number, name: string, members: number[] } | null = null;

  ngOnInit() {
    this.selectedReceivers = [...this.messageManager.selectedReceivers$.getValue()];
    this.loadRecipients();
    this.loadCustomGroups();
  }

  loadRecipients() {
    this.http.post<RecipientGroup[]>(`${Config.API_URL}/v1/messages/recipients`, { 
        message_type: this.messageManager.messageType.getValue() 
    }, { withCredentials: true }).subscribe({
      next: (groups) => {
        const activeCat = this.messageManager.activeCategory$.getValue();
        this.availableGroups = groups.map(g => ({ 
            ...g, 
            expanded: activeCat ? g.group === activeCat : true 
        }));
        
        // If the active category is a "select" type (e.g. teachers-select), find the relevant users group (e.g. teachers)
        if (activeCat?.includes('select')) {
            const baseGroup = activeCat.split('-')[0];
            const found = this.availableGroups.find(g => g.group === baseGroup);
            if (found) found.expanded = true;
        }
      },
      error: (e) => console.error(e)
    });
  }

  selectCategory(group: RecipientGroup) {
      this.selectedCategory = group;
      this.selectedType = 'category';
      this.selectedGroup = null;
      if (group.group?.includes('all')) {
          this.addAllInCategory();
      }
  }

  selectUserGroup(group: any) {
      this.selectedGroup = group;
      delete this.alerts['selection'];
      this.dropdownManager.selected_dropdown = '';
  }

  addGroupMembers() {
      if (!this.selectedGroup) return;
      const group = this.selectedGroup;
      const activeCat = this.messageManager.activeCategory$.getValue();
      let allowedGroups = this.availableGroups;
      
      if (activeCat && !activeCat.includes('all-select')) {
          const baseGroup = activeCat.split('-')[0];
          allowedGroups = this.availableGroups.filter(g => g.group === baseGroup);
      }

      const uniqueUsers = Array.from(new Map(allowedGroups.flatMap(g => g.users).map(u => [u.person_id, u])).values());
      const missingIds = group.members.filter((id: number) => !uniqueUsers.some(u => u.person_id === id));
      
      group.members.forEach((id: number) => {
          const user = uniqueUsers.find(u => u.person_id === id);
          if (user && !this.selectedReceivers.some(r => r.person_id === user.person_id)) {
              this.selectedReceivers.push(user);
          }
      });

      if (missingIds.length > 0) {
          this.alerts['selection'] = new Alert('error', `Pozor: ${missingIds.length} osob(y) ze skupiny nelze přidat, protože nejsou v aktuální nabídce pro tento typ zprávy.`);
          setTimeout(() => delete this.alerts['selection'], 5000);
      }

      this.updateGlobalState();
  }

  toggleGroup(group: RecipientGroup) {
      const original = this.availableGroups.find(g => g.group === group.group);
      if (original) original.expanded = !original.expanded;
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
      const activeCat = this.messageManager.activeCategory$.getValue();
      const lowerSearch = this.searchText.toLowerCase();
      
      let groupsToProcess = this.availableGroups;
      if (activeCat && !activeCat.includes('all-select')) {
          const baseGroup = activeCat.split('-')[0];
          groupsToProcess = this.availableGroups.filter(g => g.group === baseGroup);
      }

      if (!lowerSearch) return groupsToProcess;
      
      return groupsToProcess.map(g => {
          const matchedUsers = g.users.filter(u => 
              u.full_name.toLowerCase().includes(lowerSearch) || 
              (u.role && u.role.toLowerCase().includes(lowerSearch))
          );
          return {
              ...g,
              users: matchedUsers
          };
      }).filter(g => g.users.length > 0 || g.label.toLowerCase().includes(lowerSearch));
  }

  getFlattenedUsers() {
      return this.getFilteredGroups()
          .flatMap(g => g.users)
          .filter(u => !this.selectedReceivers.some(r => r.person_id === u.person_id));
  }

  getUsersInCategory() {
      if (this.selectedType === 'category') {
          if (!this.selectedCategory) return [];
          if (!this.searchText) return this.selectedCategory.users;
          const lowerSearch = this.searchText.toLowerCase();
          return this.selectedCategory.users.filter(u => 
              u.full_name.toLowerCase().includes(lowerSearch) || 
              (u.role && u.role.toLowerCase().includes(lowerSearch))
          );
      } else {
          if (!this.selectedGroup) return [];
          const allSystemUsers = this.availableGroups.flatMap(g => g.users);
          // Get unique users by person_id
          const uniqueUsers = Array.from(new Map(allSystemUsers.map(u => [u.person_id, u])).values());
          const groupUsers = this.selectedGroup.members.map(id => uniqueUsers.find(u => u.person_id === id)).filter(u => !!u) as messageReceiver[];
          
          if (!this.searchText) return groupUsers;
          const lowerSearch = this.searchText.toLowerCase();
          return groupUsers.filter(u => 
              u.full_name.toLowerCase().includes(lowerSearch) || 
              (u.role && u.role.toLowerCase().includes(lowerSearch))
          );
      }
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
      this.checkedInRight.clear();
      this.updateGlobalState();
  }

  // === UI Helpers for the new dual-panel design ===
  public toggleCheckLeft(person_id: number) {
      if (this.checkedInLeft.has(person_id)) {
          this.checkedInLeft.delete(person_id);
      } else {
          this.checkedInLeft.add(person_id);
      }
  }

  public toggleCheckRight(person_id: number) {
      if (this.checkedInRight.has(person_id)) {
          this.checkedInRight.delete(person_id);
      } else {
          this.checkedInRight.add(person_id);
      }
  }

  public isCheckedLeft(person_id: number): boolean {
      return this.checkedInLeft.has(person_id);
  }

  public isCheckedRight(person_id: number): boolean {
      return this.checkedInRight.has(person_id);
  }

  public moveSelectedToRight() {
      const allAvailable = this.availableGroups.flatMap(g => g.users);
      const toMove = allAvailable.filter(u => this.checkedInLeft.has(u.person_id));
      
      toMove.forEach(u => {
          if (!this.isSelected(u)) this.selectedReceivers.push(u);
      });
      this.checkedInLeft.clear();
      this.updateGlobalState();
  }

  public moveAllToRight() {
      const allAvailable = this.availableGroups.flatMap(g => g.users);
      allAvailable.forEach(u => {
          if (!this.isSelected(u)) this.selectedReceivers.push(u);
      });
      this.checkedInLeft.clear();
      this.updateGlobalState();
  }

  public moveSelectedToLeft() {
      this.selectedReceivers = this.selectedReceivers.filter(u => !this.checkedInRight.has(u.person_id));
      this.checkedInRight.clear();
      this.updateGlobalState();
  }

  public moveAllToLeft() {
      this.selectedReceivers = [];
      this.checkedInRight.clear();
      this.updateGlobalState();
  }

  public closeModal() {
      this.modalManager.closeModal('select_receiver');
  }

  public confirmSelection() {
      this.updateGlobalState();
      this.closeModal();
  }

  loadCustomGroups() {
      this.http.get<any>(`${Config.API_URL}/v1/messages/receiver_groups`, { withCredentials: true }).subscribe({
          next: (groups) => {
              if (Array.isArray(groups)) {
                  this.customGroups = groups;
              }
          },
          error: (e) => console.error(e)
      });
  }

  saveAsGroup() {
      if (!this.newGroupName) return;

      const exists = this.customGroups.some(g => g.name.toLowerCase() === this.newGroupName.trim().toLowerCase());
      if (exists) {
          this.alerts['selection'] = new Alert('error', `Skupina s názvem "${this.newGroupName}" již existuje.`);
          setTimeout(() => delete this.alerts['selection'], 5000);
          return;
      }

      const members = this.selectedReceivers.map(r => r.person_id);
      this.http.post<any>(`${Config.API_URL}/v1/messages/receiver_groups`, {
          name: this.newGroupName.trim(),
          members
      }, { withCredentials: true }).subscribe({
          next: (res) => {
              if (res.success) {
                  this.loadCustomGroups();
                  this.showGroupSave = false;
                  this.newGroupName = '';
              }
          }
      });
  }

  selectGroup(group: any) {
      const allUsers = this.availableGroups.flatMap(g => g.users);
      const newSelection: messageReceiver[] = [];
      group.members.forEach((id: number) => {
          const user = allUsers.find(u => u.person_id === id);
          if (user && !newSelection.some(r => r.person_id === user.person_id)) {
              newSelection.push(user);
          }
      });
      this.selectedReceivers = newSelection;
      this.updateGlobalState();
  }

  deleteGroup(group: any) {
      if (!group?.id) return;
      this.http.delete(`${Config.API_URL}/v1/messages/receiver_groups/${group.id}`, { withCredentials: true }).subscribe({
          next: () => {
              this.loadCustomGroups();
              if (this.selectedGroup?.id === group.id) {
                  this.selectedGroup = null;
              }
          }
      });
  }

  public isAllCategory(): boolean {
    return this.selectedType === 'category' && this.selectedCategory?.group?.includes('all') === true;
  }
}
