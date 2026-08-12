import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { CheckboxComponent } from '@Components/Checkbox';
import { ModalManager } from '@Schoolingo/modal';
import { AddRuleModalComponent } from './add-rule-modal/add-rule-modal.component';
import { SkeletonComponent } from 'boneyard-js/angular';

interface NotificationRule {
  rule_id?: number;
  type: string;
  conditions: any;
  enabled: boolean;
}

@Component({
  standalone: true,
  selector: 'settings-notifications',
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent, CheckboxComponent, SkeletonComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public perms = inject(Permission)
  public modalManager = inject(ModalManager);
  
  public rules: NotificationRule[] = [];
  public notificationApplicationServerKey: ArrayBuffer | null = null; 
  public loading = false;
  public pushEnabled = false;

  public simpleTypes: any[] = [];
  public advancedTypes: any[] = [];

  public editingRuleId: number | null | undefined = null;

  ngOnInit(): void {
    this.loadConfig();
    this.checkPushPermission();

    this.modalManager.addModal('add-adv-rule', {
      title: 'notifications.settings.advanced.add',
      icon: 'settings-automation',
      width: 600,
      closeable: true,
      items: [
        { type: 'component', component: AddRuleModalComponent }
      ]
    });

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((subscription) => {
        if (!subscription) return;
        const options = subscription.options;
        this.notificationApplicationServerKey = options.applicationServerKey; // the public key
      });
    });


  }

  private loadConfig(): void {
    this.loading = true;
    this.http.get<{ simpleTypes: any[], advancedTypes: any[] }>(
      `${Config.API_URL}/v1/notifications/config`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.simpleTypes = data.simpleTypes;
        this.advancedTypes = data.advancedTypes;
        this.loadRules();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadRules(): void {
    this.loading = true;
    this.http.get(
      `${Config.API_URL}/v1/notifications/rules`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if (data.rules) {
          this.rules = data.rules.map((rule: any) => ({
            ...rule,
            conditions: typeof rule.conditions === 'string' 
              ? JSON.parse(rule.conditions) 
              : rule.conditions
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public toggleSimpleNotification(typeId: string): void {
    const existingRule = this.rules.find(r => r.type === typeId);

    if (existingRule) {
      // Update existing rule
      this.toggleRule(existingRule);
    } else {
      // Create new rule
      this.addRule(typeId);
    }
  }

  public toggleRule(rule: NotificationRule): void {
    if (!rule.rule_id || rule.rule_id < 0) return;

    rule.enabled = !rule.enabled;

    this.http.put(
      `${Config.API_URL}/v1/notifications/rules/${rule.rule_id}`,
      { enabled: rule.enabled },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        console.log('Rule updated');
      },
      error: () => {
        rule.enabled = !rule.enabled; // Revert on error
      }
    });
  }

  public updateRule(rule: NotificationRule): void {
    if (!rule.rule_id) return;

    if (rule.rule_id < 0) {
      // It's a new rule, POST it
      this.http.post(
        `${Config.API_URL}/v1/notifications/rules`,
        { type: rule.type, conditions: rule.conditions, enabled: rule.enabled },
        { withCredentials: true }
      ).subscribe({
        next: (data: any) => {
          if (data.rule_id) {
            rule.rule_id = data.rule_id;
            this.editingRuleId = null;
          }
        }
      });
    } else {
      // Existing rule, PUT it
      this.http.put(
        `${Config.API_URL}/v1/notifications/rules/${rule.rule_id}`,
        { 
          enabled: rule.enabled,
          conditions: rule.conditions
        },
        { withCredentials: true }
      ).subscribe({
        next: () => {
          console.log('Rule updated');
          this.editingRuleId = null;
        }
      });
    }
  }

  public cancelEdit(rule: NotificationRule): void {
    if (rule.rule_id && rule.rule_id < 0) {
      this.rules = this.rules.filter(r => r !== rule);
    }
    this.editingRuleId = null;
  }

  public openAddRuleModal(): void {
    this.modalManager.openModal('add-adv-rule', {
      types: this.getVisibleAdvancedTypes(),
      hasRuleOfType: (typeId: string) => this.hasRuleOfType(typeId),
      onAdd: (typeId: string) => this.addRule(typeId)
    });
  }

  public addRule(type: string): void {
    const typeConfig = this.getTypeConfig(type);
    if (!typeConfig) return;

    const conditions: any = {};
    if (typeConfig.hasConditions && typeConfig.conditionFields) {
      typeConfig.conditionFields.forEach((field: any) => {
        conditions[field.key] = field.default;
      });
    }

    const newRule: NotificationRule = {
      rule_id: -Date.now(), // Temporary ID
      type,
      conditions,
      enabled: true
    };

    if (typeConfig.hasConditions) {
        this.rules.unshift(newRule);
        this.editingRuleId = newRule.rule_id;
    } else {
        // Simple rules don't need editing, just POST directly
        this.http.post(
          `${Config.API_URL}/v1/notifications/rules`,
          { type: newRule.type, conditions: newRule.conditions, enabled: newRule.enabled },
          { withCredentials: true }
        ).subscribe({
          next: (data: any) => {
            if (data.rule_id) {
              newRule.rule_id = data.rule_id;
              this.rules.push(newRule);
            }
          }
        });
    }
  }

  public deleteRule(rule: NotificationRule): void {
    if (!rule.rule_id) return;

    this.http.delete(
      `${Config.API_URL}/v1/notifications/rules/${rule.rule_id}`,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.rules = this.rules.filter(r => r.rule_id !== rule.rule_id);
      }
    });
  }

  public getTypeConfig(type: string) {
    return [...this.simpleTypes, ...this.advancedTypes].find(t => t.id === type);
  }

  public isSimpleType(type: string): boolean {
    return this.simpleTypes.some(t => t.id === type);
  }

  public getSimpleTypes(): any[] {
    return this.simpleTypes.filter(t => t.roles.includes('all') || this.perms.checkPermission(t.roles as any));
  }

  public getVisibleAdvancedTypes(): any[] {
    return this.advancedTypes.filter(t => t.roles.includes('all') || this.perms.checkPermission(t.roles as any));
  }

  public getAdvancedRules(): NotificationRule[] {
    const visibleTypes = this.getVisibleAdvancedTypes().map(t => t.id);
    return this.rules.filter(r => !this.isSimpleType(r.type) && visibleTypes.includes(r.type));
  }

  public findRuleByType(typeId: string): NotificationRule | undefined {
    return this.rules.find(r => r.type === typeId);
  }

  public hasRuleOfType(typeId: string): boolean {
    return this.rules.some(r => r.type === typeId);
  }

  private checkPushPermission(): void {
    if ('Notification' in window) {
      this.pushEnabled = Notification.permission === 'granted';
    }
  }

  public async enablePushNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      alert('Tento prohlížeč nepodporuje push notifikace');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      alert('Tento prohlížeč nepodporuje service workers');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.notificationApplicationServerKey
      });

      // Send subscription to server
      const subscriptionJSON = subscription.toJSON();
      await this.http.post(
        `${Config.API_URL}/v1/notifications/push/subscribe`,
        {
          endpoint: subscriptionJSON.endpoint,
          p256dh: subscriptionJSON.keys?.['p256dh'],
          auth: subscriptionJSON.keys?.['auth']
        },
        { withCredentials: true }
      ).toPromise();

      this.pushEnabled = true;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
