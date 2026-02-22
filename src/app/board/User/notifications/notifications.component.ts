import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';

interface NotificationRule {
  rule_id?: number;
  type: string;
  conditions: any;
  enabled: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public perms = inject(Permission)
  
  public rules: NotificationRule[] = [];
  public notificationApplicationServerKey: ArrayBuffer | null = null; 
  public loading = false;
  public pushEnabled = false;

  // Simple notification types (quick toggles)
  public simpleTypes = [
    { 
      id: 'grade_new', 
      name: 'Nová známka',
      icon: 'star',
      color: '#ffc107',
      description: 'Upozornění při přidání nové známky',
      hasConditions: false,
      conditionFields: []
    },
    { 
      id: 'homework_new', 
      name: 'Nový domácí úkol',
      icon: 'book-2',
      color: '#7cd67c',
      description: 'Upozornění při zadání nového úkolu',
      hasConditions: false,
      conditionFields: []
    },
    { 
      id: 'message_new', 
      name: 'Nová zpráva',
      icon: 'message',
      color: '#4aa3ff',
      description: 'Upozornění při přijetí nové zprávy',
      hasConditions: false,
      conditionFields: []
    },
    { 
      id: 'absence_new', 
      name: 'Nová absence',
      icon: 'calendar-x',
      color: '#ff9800',
      description: 'Upozornění při zapsání absence',
      hasConditions: false,
      conditionFields: []
    },
    { 
      id: 'substitution_new', 
      name: 'Nová suplující hodina',
      icon: 'refresh',
      color: '#9c27b0',
      description: 'Upozornění při změně rozvrhu',
      hasConditions: false,
      conditionFields: []
    },
    { 
      id: 'reward_new', 
      name: 'Nová odměna',
      icon: 'trophy',
      color: '#f5d142',
      description: 'Upozornění při obdržení nové odměny',
      hasConditions: false,
      conditionFields: []
    }
  ];

  // Advanced notification types (with conditions)
  public advancedTypes = [
    { 
      id: 'advanced_grade_average_above', 
      name: 'Průměr vyšší než',
      icon: 'trending-up',
      color: '#4caf50',
      hasConditions: true,
      conditionFields: [
        { key: 'value', label: 'Hodnota', type: 'number', default: 3, min: 1, max: 5 }
      ]
    },
    { 
      id: 'advanced_grade_average_below', 
      name: 'Průměr nižší než',
      icon: 'trending-down',
      color: '#ff5757',
      hasConditions: true,
      conditionFields: [
        { key: 'value', label: 'Hodnota', type: 'number', default: 2, min: 1, max: 5 }
      ]
    },
    { 
      id: 'advanced_absence_count_above', 
      name: 'Absence vyšší než',
      icon: 'alert-circle',
      color: '#ff5757',
      hasConditions: true,
      conditionFields: [
        { key: 'hours', label: 'Počet hodin', type: 'number', default: 10, min: 1 },
        { key: 'percent', label: 'Absence v %', type: 'number', default: 30, min: 1, max: 100 },
      ]
    },
    { 
      id: 'advanced_homework_deadline_soon', 
      name: 'Blížící se termín úkolu',
      icon: 'clock-exclamation',
      color: '#ff9800',
      hasConditions: true,
      conditionFields: [
        { key: 'days', label: 'Dny před termínem', type: 'number', default: 1, min: 1, max: 7 }
      ]
    }
  ];

  public editingRuleId: number | null | undefined = null;

  ngOnInit(): void {
    this.loadRules();
    this.checkPushPermission();

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((subscription) => {
        if (!subscription) return;
        const options = subscription.options;
        this.notificationApplicationServerKey = options.applicationServerKey; // the public key
      });
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
    if (!rule.rule_id) return;

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
      type,
      conditions,
      enabled: true
    };

    this.http.post(
      `${Config.API_URL}/v1/notifications/rules`,
      newRule,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if (data.rule_id) {
          newRule.rule_id = data.rule_id;
          this.rules.push(newRule);
          
          if (typeConfig.hasConditions) {
              this.editingRuleId = newRule.rule_id;
          }
        }
      }
    });
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

  public findRuleByType(typeId: string): NotificationRule | undefined {
    return this.rules.find(r => r.type === typeId);
  }

  public getAdvancedRules(): NotificationRule[] {
    return this.rules.filter(r => !this.isSimpleType(r.type));
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
