import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

interface GdprConsent {
  consent_id?: number;
  type: string;
  description: string;
  granted: boolean;
  granted_at?: Date;
  expires_at?: Date;
  required: boolean;
}

interface DataExportRequest {
  request_id?: number;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  requested_at: Date;
  completed_at?: Date;
  download_url?: string;
}

@Component({
  selector: 'app-gdpr',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './gdpr.component.html',
  styleUrl: './gdpr.component.css'
})
export class GdprComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);

  public consents: GdprConsent[] = [];
  public dataExportRequests: DataExportRequest[] = [];
  public loading = false;
  public exportLoading = false;
  public deleteAccountLoading = false;
  public showDeleteConfirm = false;
  public deleteConfirmText = '';

  // GDPR consent types with descriptions
  public consentTypes = [
    {
      id: 'essential',
      name: 'Nezbytné zpracování',
      icon: 'lock',
      color: '#6366f1',
      description: 'Zpracování osobních údajů nezbytné pro fungování služby a plnění smluvních povinností.',
      required: true
    },
    {
      id: 'analytics',
      name: 'Analytika a statistiky',
      icon: 'chart-bar',
      color: '#8b5cf6',
      description: 'Sběr anonymizovaných dat pro zlepšování služby a analýzu využívání.',
      required: false
    },
    {
      id: 'marketing',
      name: 'Marketingová komunikace',
      icon: 'mail',
      color: '#06b6d4',
      description: 'Zasílání informací o novinkách, akcích a vzdělávacích materiálech.',
      required: false
    },
    {
      id: 'third_party',
      name: 'Sdílení s partnery',
      icon: 'users',
      color: '#f59e0b',
      description: 'Sdílení údajů s vybranými partnery pro poskytování doplňkových služeb.',
      required: false
    },
    {
      id: 'profiling',
      name: 'Personalizace',
      icon: 'user-scan',
      color: '#ec4899',
      description: 'Přizpůsobení obsahu a funkcí na základě vašeho chování a preferencí.',
      required: false
    }
  ];

  ngOnInit(): void {
    this.loadConsents();
    this.loadDataExportRequests();
  }

  private loadConsents(): void {
    this.loading = true;
    this.http.get<{ consents: GdprConsent[] }>(
      `${Config.API_URL}/v1/gdpr/consents`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.consents) {
          this.consents = data.consents;
        } else {
          // Initialize with default consents if none exist
          this.consents = this.consentTypes.map(type => ({
            type: type.id,
            description: type.description,
            granted: type.required,
            required: type.required
          }));
        }
        this.loading = false;
      },
      error: () => {
        // Initialize with default consents on error
        this.consents = this.consentTypes.map(type => ({
          type: type.id,
          description: type.description,
          granted: type.required,
          required: type.required
        }));
        this.loading = false;
      }
    });
  }

  private loadDataExportRequests(): void {
    this.http.get<{ requests: DataExportRequest[] }>(
      `${Config.API_URL}/v1/gdpr/export-requests`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.requests) {
          this.dataExportRequests = data.requests;
        }
      }
    });
  }

  public getConsentByType(typeId: string): GdprConsent | undefined {
    return this.consents.find(c => c.type === typeId);
  }

  public getConsentConfig(typeId: string) {
    return this.consentTypes.find(t => t.id === typeId);
  }

  public toggleConsent(typeId: string): void {
    const consent = this.getConsentByType(typeId);
    const config = this.getConsentConfig(typeId);

    if (consent?.required || config?.required) {
      return; // Cannot toggle required consents
    }

    if (consent) {
      consent.granted = !consent.granted;
      this.updateConsent(consent);
    } else {
      // Create new consent
      const newConsent: GdprConsent = {
        type: typeId,
        description: config?.description || '',
        granted: true,
        required: false
      };
      this.consents.push(newConsent);
      this.updateConsent(newConsent);
    }
  }

  private updateConsent(consent: GdprConsent): void {
    this.http.put(
      `${Config.API_URL}/v1/gdpr/consents`,
      consent,
      { withCredentials: true }
    ).subscribe({
      next: (response: any) => {
        if (response.consent_id) {
          consent.consent_id = response.consent_id;
        }
      },
      error: () => {
        // Revert on error
        consent.granted = !consent.granted;
      }
    });
  }

  public grantAllOptional(): void {
    this.consentTypes.filter(t => !t.required).forEach(type => {
      const consent = this.getConsentByType(type.id);
      if (consent && !consent.granted) {
        consent.granted = true;
        this.updateConsent(consent);
      } else if (!consent) {
        const newConsent: GdprConsent = {
          type: type.id,
          description: type.description,
          granted: true,
          required: false
        };
        this.consents.push(newConsent);
        this.updateConsent(newConsent);
      }
    });
  }

  public revokeAllOptional(): void {
    this.consents.filter(c => !c.required).forEach(consent => {
      if (consent.granted) {
        consent.granted = false;
        this.updateConsent(consent);
      }
    });
  }

  public requestDataExport(): void {
    this.exportLoading = true;
    this.http.post(
      `${Config.API_URL}/v1/gdpr/export`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: (response: any) => {
        if (response.request_id) {
          this.dataExportRequests.unshift({
            request_id: response.request_id,
            status: 'pending',
            requested_at: new Date()
          });
        }
        this.exportLoading = false;
      },
      error: () => {
        this.exportLoading = false;
      }
    });
  }

  public downloadExport(request: DataExportRequest): void {
    if (request.download_url) {
      window.open(request.download_url, '_blank');
    }
  }

  public requestAccountDeletion(): void {
    if (this.deleteConfirmText.toLowerCase() !== 'smazat účet') {
      return;
    }

    this.deleteAccountLoading = true;
    this.http.delete(
      `${Config.API_URL}/v1/gdpr/account`,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        // Redirect to logout or confirmation page
        window.location.href = '/login';
      },
      error: () => {
        this.deleteAccountLoading = false;
      }
    });
  }

  public getExportStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Čeká na zpracování',
      'processing': 'Zpracovává se',
      'ready': 'Připraveno ke stažení',
      'expired': 'Vypršelo'
    };
    return statusMap[status] || status;
  }

  public getExportStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': '#f59e0b',
      'processing': '#6366f1',
      'ready': '#22c55e',
      'expired': '#ef4444'
    };
    return colorMap[status] || '#6b7280';
  }
}
