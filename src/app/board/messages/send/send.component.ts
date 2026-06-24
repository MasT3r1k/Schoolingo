import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';
import {
  MessageManager,
  messageReceiver,
  MessageType,
  messageTypes,
} from '@Schoolingo/messages';

interface RecipientGroup {
  group: string;
  label: string;
  users: messageReceiver[];
  expanded?: boolean;
}
import { Permission } from '@Schoolingo/permission';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Alert } from '../../../infrastructure/alert/alert';
import { Homeworks } from '@Schoolingo/homeworks';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Authentication } from '@Schoolingo/authentication';
import { HttpClient } from '@angular/common/http';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { School } from '@Schoolingo/school';
import { UploadFilesModalComponent } from '@Components/upload-files-modal/upload-files-modal.component';
import { SelectReceiverComponent } from './modals/select-receiver/select-receiver.component';
import { UnsavedChangesComponent } from './modals/unsaved-changes/unsaved-changes.component';
import { ComponentCanDeactivate } from '../../../Guards/unsaved-changes.guard';
import { CheckboxComponent } from '@Components/Checkbox';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  imports: [
    FormsModule,
    IconsModule,
    CheckboxComponent,
    DropdownComponent
  ],
  templateUrl: './send.component.html',
  styleUrl: './send.component.css',
})
export class SendComponent implements OnInit, ComponentCanDeactivate {
  isChanged = false;

  AppConfig = Config;
  messageTypes = messageTypes;
  subscribers: Subscription[] = [];

  // === Injections ===
  public auth = inject(Authentication);
  public l = inject(Locale);
  public perms = inject(Permission);
  public messageManager = inject(MessageManager);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  public homeworks = inject(Homeworks);
  private http = inject(HttpClient);
  public Utils = Utils;
  private router = inject(Router);
  private school = inject(School);

  // === Alerts ===
  public alerts: Record<string, Alert> = {};

  // === Tabs ===
  public selectedOptionTab = new BehaviorSubject<number>(0);

  // === Options ===
  public excuseAllDay = false;
  public config: any = {};

  // === Excuses ===
  public excuseDate = moment().format('YYYY-MM-DD');
  public excuseDateTo = moment().format('YYYY-MM-DD');
  public excuseHourFrom = 1;
  public excuseHourTo = 1;
  public hours: { label: string, start: string, end: string }[] = [];

  public getHourLabel(hour: number): string {
    const h = this.hours[hour - 1];
    return h ? `${h.label} (${h.start} - ${h.end})` : `${hour}. hodina`;
  }

  public calculateHours(limit: number = 10): void {
    const schoolConfig = this.school.config.getValue();
    if (!schoolConfig) return;
    
    const start_hour = schoolConfig.start_hour;
    const start_minute = schoolConfig.start_minute;
    const lesson_hour = schoolConfig.lesson_hour;
    const break_time = schoolConfig.break_time;
    const breaks = schoolConfig.breaks || [];
    
    const newHours: { label: string, start: string, end: string }[] = [];
    let currentStart = moment().set({ hour: start_hour, minute: start_minute, second: 0, millisecond: 0 });
    
    /** 
     * We generate up to the limit, but at least 8 hours by default 
     * to provide a consistent UI if timetable is empty.
     */
    const finalLimit = Math.max(limit, 8);

    for (let i = 1; i <= finalLimit; i++) {
        const startStr = currentStart.format('HH:mm');
        const currentEnd = currentStart.clone().add(lesson_hour, 'minutes');
        const endStr = currentEnd.format('HH:mm');
        
        newHours.push({
            label: `${i}. hodina`,
            start: startStr,
            end: endStr
        });
        
        // Calculate next start using the break AFTER this hour
        const breakRule = breaks.find((b: { hour: number, minutes: number }) => b.hour === i + 1);
        const breakMinutes = breakRule ? breakRule.minutes : break_time;
        currentStart = currentEnd.clone().add(breakMinutes, 'minutes');
    }
    this.hours = newHours;

    // Reset offsets if exceeding new limit
    if (this.excuseHourFrom > finalLimit) this.excuseHourFrom = 1;
    if (this.excuseHourTo > finalLimit) this.excuseHourTo = 1;
  }

  public updateMaxHours(): void {
    if (this.auth.getUser().role !== 'parent' || !this.checkMessageType([messageTypes.EXCUSESTUDENT])) {
      this.calculateHours(10);
      return;
    }

    const childIndex = this.auth.selectedChild.getValue();
    const child = this.auth.getUser().children[childIndex];
    if (!child) return;

    const payload = {
      type: 'person',
      id: child.childId,
      time: this.excuseDate
    };

    this.http.post<any>(`${Config.API_URL}/v1/timetable`, payload, { withCredentials: true }).subscribe({
      next: (data) => {
        let max = 0;
        if (data.timetable) {
          data.timetable.forEach((t: any) => {
            if (t.hour > max) max = t.hour;
          });
        }
        if (data.substitution) {
          data.substitution.forEach((s: any) => {
            if (s.end_hour > max) max = s.end_hour;
          });
        }
        
        this.calculateHours(max);
      },
      error: () => this.calculateHours(10)
    });
  }


  // === Receivers ===
  public availableGroups: RecipientGroup[] = [];
  public selectedReceivers: messageReceiver[] = [];
  public selectedCategory: RecipientGroup | null = null;
  public searchText = '';
  public receivers: messageReceiver[] = [];

  // === Receiver handling ===
  public toggleReceiverSelection(receiver: messageReceiver): void {
    this.isChanged = true;
    const index = this.selectedReceivers.findIndex((r) => r.person_id === receiver.person_id);
    if (index > -1) {
      this.selectedReceivers.splice(index, 1);
    } else {
      this.selectedReceivers.push(receiver);
    }
  }

  public getSelectedReceivers(): messageReceiver[] {
    const receiversMap: Map<number, messageReceiver> = new Map();

    this.selectedReceivers.forEach((receiver: messageReceiver) => {
      // přidáme třídní učitele
      if (
        this.messageManager.options.copyToClassTeacher &&
        receiver.classTeacher
      ) {
        for (let classteacher of receiver.classTeacher) {
          if (!receiversMap.has(classteacher.person_id) && this.auth.getUser().person_id != classteacher.person_id) {
            receiversMap.set(classteacher.person_id, {
              ...classteacher,
              role: 'teacher'
            });
          }
        }
      }

      // přidáme hlavního příjemce
      receiversMap.set(receiver.person_id, receiver);

      // přidáme rodiče
      if (this.messageManager.options.copyToParents && receiver.parents) {
        for (let parent of receiver.parents) {
          if (!receiversMap.has(parent.person_id)) {
            receiversMap.set(
              parent.person_id,
              {
                ...parent,
                child: receiver.full_name,
                role: 'parent',
                type: 'parent'
              });
          }
        }
      }
    });

    return Array.from(receiversMap.values());
  }

  public isReceiverSelected(receiver: messageReceiver): boolean {
    return this.getSelectedReceivers().some((r) => r.person_id === receiver.person_id);
  }

  public removeSelectedReceiver(id: number): void {
    this.isChanged = true;
    const idx = this.selectedReceivers.findIndex((r) => r.person_id === id);
    if (idx > -1) this.selectedReceivers.splice(idx, 1);
  }

  public getReceiverById(id: number): messageReceiver | undefined {
    return this.receivers.find((r) => r.person_id === id);
  }

  public loadRecipients() {
    const payload: any = { 
      message_type: this.messageManager.message_type 
    };

    if (this.auth.getUser().role === 'parent' && this.messageManager.message_type === messageTypes.EXCUSESTUDENT) {
      const childIndex = this.auth.selectedChild.getValue();
      const child = this.auth.getUser().children[childIndex];
      if (child) {
        payload.child_id = child.childId;
      }
    }

    this.http.post<RecipientGroup[]>(`${Config.API_URL}/v1/messages/recipients`, payload, { withCredentials: true }).subscribe({
      next: (groups) => {
        this.availableGroups = groups;
        if (this.availableGroups.length > 0) {
          this.selectCategory(this.availableGroups[0]);

          // Automatically select class teacher for parent excuses
          if (this.auth.getUser().role === 'parent' && this.messageManager.message_type === messageTypes.EXCUSESTUDENT) {
            const classTeacherGroup = this.availableGroups.find(g => g.group === 'teacher');
            if (classTeacherGroup && classTeacherGroup.users.length > 0) {
              this.messageManager.selectedReceivers$.next([...classTeacherGroup.users]);
            }
          }
        } else {
          this.selectedCategory = null;
        }
      },
      error: (e) => console.error(e)
    });
  }

  public selectCategory(group: RecipientGroup) {
    if (this.selectedCategory?.group === group.group) {
        this.dropdownManager.selected_dropdown = '';
        return;
    }
    this.selectedCategory = group;
    this.messageManager.activeCategory$.next(group.group);
    this.messageManager.selectedReceivers$.next([]);
    this.dropdownManager.selected_dropdown = '';
    
    if (group.group.includes('all')) {
      this.addAllInCategory();
    }
  }

  public toggleRecipient(receiver: messageReceiver) {
    this.isChanged = true;
    const isSingle = !this.selectedCategory?.group?.includes('select') && !this.selectedCategory?.group?.includes('all');
    const newReceivers = [...this.selectedReceivers];
    
    if (isSingle) {
        this.messageManager.selectedReceivers$.next([receiver]);
    } else {
        const index = newReceivers.findIndex(r => r.person_id === receiver.person_id);
        if (index > -1) {
          newReceivers.splice(index, 1);
        } else {
          newReceivers.push(receiver);
        }
        this.messageManager.selectedReceivers$.next(newReceivers);
    }
  }

  public isSelected(receiver: messageReceiver): boolean {
    return this.selectedReceivers.some(r => r.person_id === receiver.person_id);
  }

  public getFilteredGroups() {
      if (!this.searchText) return this.availableGroups;
      const lowerSearch = this.searchText.toLowerCase();
      return this.availableGroups.filter(g => 
          g.label.toLowerCase().includes(lowerSearch) ||
          g.users.some((u: messageReceiver) => 
              u.full_name.toLowerCase().includes(lowerSearch) || 
              (u.role && u.role.toLowerCase().includes(lowerSearch))
          )
      );
  }

  public getUsersInCategory() {
      if (!this.selectedCategory) return [];
      if (!this.searchText) return this.selectedCategory.users;
      const lowerSearch = this.searchText.toLowerCase();
      return this.selectedCategory.users.filter((u: messageReceiver) => 
          u.full_name.toLowerCase().includes(lowerSearch) || 
          (u.role && u.role.toLowerCase().includes(lowerSearch))
      );
  }

  public addAllInCategory() {
      this.isChanged = true;
      if (!this.selectedCategory) return;
      const newReceivers = [...this.selectedReceivers];
      this.getUsersInCategory().forEach((u: messageReceiver) => {
          if (!newReceivers.some(r => r.person_id === u.person_id)) {
              newReceivers.push(u);
          }
      });
      this.messageManager.selectedReceivers$.next(newReceivers);
  }

  public openReceiverModal() {
      this.modalManager.openModal('select_receiver');
  }

  public removeAllSelected() {
      this.isChanged = true;
      this.messageManager.selectedReceivers$.next([]);
  }

  public getTotalFilteredUsers(): number {
      return this.getFilteredGroups().reduce((acc, g) => acc + g.users.length, 0);
  }

  public getCountOfReceiverType(type: string): number {
    return this.selectedReceivers.filter((r) => r.role === type).length;
  }

  public shouldShowCopyToClassTeacher(): boolean {
    if (!this.selectedCategory) return false;
    const group = this.selectedCategory.group;
    return (
      group.startsWith('student') ||
      group.startsWith('parents') ||
      group === 'students_select' ||
      group === 'parents_select'
    );
  }

  public shouldShowCopyToParents(): boolean {
    if (!this.selectedCategory) return false;
    const group = this.selectedCategory.group;
    return (
      group.startsWith('student') ||
      group === 'students_select'
    );
  }

  public shouldShowCopyToStudents(): boolean {
    if (!this.selectedCategory) return false;
    const group = this.selectedCategory.group;
    return (
      group.startsWith('parents') ||
      group === 'parents_select'
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.isChanged) {
      $event.returnValue = true;
    }
  }

  // === Lifecycle ===
  onConceptChange() {
    this.isChanged = true;
  }

  public reset(): void {
    this.isChanged = false;
    this.messageManager.message_type = 0;
    this.messageManager.message = '';
    this.messageManager.topic = '';
    this.messageManager.files = [];
    this.selectedReceivers = [];
    this.messageManager.selectedReceivers$.next([]);
    this.messageManager.draft_id = null;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.isChanged) {
      return true;
    }

    return new Observable<boolean>((observer) => {
      this.modalManager.openModal('unsaved_changes', {
        saveConcept: () => {
          observer.next(true);
          observer.complete();
          this.sendMessage(true, false);
          this.modalManager.closeModal('unsaved_changes');
        },
        onConfirm: () => {
          observer.next(true);
          observer.complete();
          this.reset();
          this.modalManager.closeModal('unsaved_changes');
        },
        onCancel: () => {
          observer.next(false);
          observer.complete();
          this.modalManager.closeModal('unsaved_changes');
        }
      });
    });
  }

  public refreshPage(): void {
    this.messageManager.selectedReceivers$.next([]);
    this.loadRecipients();
    if (this.messageManager.message_type === messageTypes.EXCUSESTUDENT && this.auth.getUser().role === 'parent') {
      this.updateMaxHours();
    }
    if (this.messageManager.message_type === messageTypes.RATESTUDENT) {
      this.messageManager.options.copyToParents = true;
    }
    setTimeout(() => this.selectedOptionTab.next(0), 300);
  }

  ngOnInit(): void {
    this.isChanged = false;

    // Subscribe to selected receivers from modal
    this.subscribers.push(
      this.messageManager.selectedReceivers$.subscribe((receivers) => {
        this.selectedReceivers = receivers;
      })
    );

    // Load message config
    this.http
      .get<any>(`${Config.API_URL}/v1/messages/config`, {
        withCredentials: true,
      })
      .subscribe((data) => {
        if (!('error' in data)) {
          this.config = data;
          this.refreshPage()
        }
      });

    this.subscribers.push(
      this.school.config.subscribe(() => {
        this.calculateHours();
      })
    );

    this.modalManager.addModal(
      'sendMessage_files',
      {
        title: 'documents.upload_files',
        icon: 'cloud-upload',
        closeable: false,
        items: [
          { type: 'component', component: UploadFilesModalComponent }
        ]
      }
    )

    this.modalManager.addModal(
      'select_receiver',
      {
        icon: 'users',
        title: 'messages.select_receiver',
        closeable: true,
        width: 800,
        items: [
          { type: 'component', component: SelectReceiverComponent }
        ]
      }
    )

    this.modalManager.addModal(
      'unsaved_changes',
      {
        title: 'messages.unsaved_changes.title',
        closeable: false,
        width: 500,
        items: [
          { type: 'component', component: UnsavedChangesComponent }
        ]
      }
    )
  }

  ngOnDestroy(): void {
    this.reset()
  }

  // === Sending message ===
  public sendMessage(is_draft: boolean = false, redirect: boolean = true): void {
    this.alerts = {};

    const type = this.messageManager.message_type;
    if (!this.perms.checkPermission(this.messageManager.types[type].perms)) {
      this.alerts['main'] = new Alert('error', 'messages.no_type_access');
      return;
    }

    const message = this.messageManager.message;
    if (!message.trim().length) {
      this.alerts['message'] = new Alert('error', 'form.required');
    }

    switch (type) {
      case messageTypes.MESSAGE:
        if (!this.messageManager.topic.trim().length && !is_draft) {
          this.alerts['topic'] = new Alert('error', 'form.required');
        }
        break;
      case messageTypes.HOMEWORK:
        if (!this.homeworks.list.length) {
          this.alerts['main'] = new Alert('error', 'messages.homeworks.empty');
        }
        if (this.messageManager.selectedHomework.getValue() == null) {
          this.alerts['homework'] = new Alert('error', 'form.required');
        }
        break;
    }

    if (Object.keys(this.alerts).length > 0) return;

    if (this.selectedReceivers.length === 0 && !is_draft) {
      this.alerts['main'] = new Alert('error', 'messages.no_receivers');
      return;
    }

    let finalMessage = message;
    if (type === messageTypes.EXCUSESTUDENT && this.auth.getUser().role === 'parent') {
      const dateRange = this.excuseDate === this.excuseDateTo 
        ? moment(this.excuseDate).format('DD. MM. YYYY')
        : `${moment(this.excuseDate).format('DD. MM. YYYY')} - ${moment(this.excuseDateTo).format('DD. MM. YYYY')}`;
      
      finalMessage = `Datum: ${dateRange}\n` +
                    `Rozsah: ${this.excuseAllDay ? 'Celý den' : this.getHourLabel(this.excuseHourFrom) + ' - ' + this.getHourLabel(this.excuseHourTo)}\n\n` +
                    message;
    }

    const payload: any = {
      message: finalMessage,
      recipients: this.selectedReceivers.flatMap((r) => r.members ? r.members : [r.person_id]),
      files: (this.messageManager.files || []).map(f => f.serverId),
      type: type,
      is_draft,
      topic: type === messageTypes.RATESTUDENT 
        ? this.l.s(this.messageManager.ratingTypes[this.messageManager.selected_rating_type].label)
        : (type === messageTypes.EXCUSESTUDENT && this.auth.getUser().role === 'parent'
          ? 'Omluvenka: ' + this.getSelectedChildName()
          : this.messageManager.topic),
      require_confirm: this.messageManager.options.requireConfirmation ?? false,
      copy_to_class_teacher: this.messageManager.options.copyToClassTeacher ?? false,
      copy_to_parents: this.messageManager.options.copyToParents ?? false,
      copy_to_students: this.messageManager.options.copyToStudents ?? false,
      draft_id: this.messageManager.draft_id || null,
      excuse_date_from: type === messageTypes.EXCUSESTUDENT ? this.excuseDate : null,
      excuse_date_to: type === messageTypes.EXCUSESTUDENT ? this.excuseDateTo : null,
      excuse_hour_from: type === messageTypes.EXCUSESTUDENT ? (this.excuseAllDay ? null : this.excuseHourFrom) : null,
      excuse_hour_to: type === messageTypes.EXCUSESTUDENT ? (this.excuseAllDay ? null : this.excuseHourTo) : null,
      excuse_all_day: type === messageTypes.EXCUSESTUDENT ? (this.excuseAllDay ? true : false) : null
    };

    if (type === messageTypes.RATESTUDENT) {
      payload.message_rating_type = this.messageManager.selected_rating_type;
    }

    this.http
      .post<{ success: boolean; message_id?: number; error?: string }>(
        `${Config.API_URL}/v1/messages/send`,
        payload,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.reset();
            this.alerts['main'] = new Alert('success', 'messages.sent');
            setTimeout(() => {
              if (redirect) {
                this.router.navigate([is_draft ? '/messages/drafts' : '/messages/sent'], { queryParams: { id: res.message_id } });
              }
            }, 1000);
          } else {
            this.alerts['main'] = new Alert(
              'error',
              res?.error || 'unknown_error'
            );
          }
        },
        error: () => {
          this.alerts['main'] = new Alert('error', 'network_error');
        },
      });
  }

  // === Helpers ===
  public getMessageTypes(): MessageType[] {
    return this.messageManager.types.filter((type) =>
      this.perms.checkPermission(type.perms)
    );
  }

  public checkMessageType(types: messageTypes[]): boolean {
    return types.includes(this.messageManager.message_type);
  }

  public openFiles(): void {
    this.modalManager.openModal('sendMessage_files', {
        files: this.messageManager.files,
        origin: 'messages',
        onAssign: (files: any) => {
            this.isChanged = true;
            this.messageManager.files = files;
        }
    });
  }

  // === Child Handling ===
  public getSelectedChildName(): string {
    const childIndex = this.auth.selectedChild.getValue();
    const child = this.auth.getUser().children[childIndex];
    return child ? `${child.first_name} ${child.last_name} (${child.classes[0]?.class_name ?? ''})` : 'Vyberte žáka';
  }

  public selectChild(index: number): void {
    this.auth.selectedChild.next(index);
    this.loadRecipients();
    this.updateMaxHours();
  }
}
