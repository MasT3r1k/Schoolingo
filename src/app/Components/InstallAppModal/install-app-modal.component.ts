import { Component, inject, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'install-app-modal',
  standalone: true,
  imports: [NgClass, IconsModule],
  template: `
    <div class="modals" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ l.s('auth.install_app.title') }}</h2>
        </div>
        <div class="modal-close" (click)="close()">
          <i-tabler name="x"></i-tabler>
        </div>
        <div class="modal-body">
          <div class="tabs">
            <div class="tab" [ngClass]="{ active: activeTab === 'android' }" (click)="activeTab = 'android'">
              <i-tabler name="brand-android"></i-tabler>
              <span>Android</span>
            </div>
            <div class="tab" [ngClass]="{ active: activeTab === 'ios' }" (click)="activeTab = 'ios'">
              <i-tabler name="brand-apple"></i-tabler>
              <span>iOS</span>
            </div>
          </div>

          <div class="content" [ngClass]="{ 'android': activeTab === 'android', 'ios': activeTab === 'ios' }">
            @if (activeTab === 'android') {
              <div class="steps">
                <div class="step">
                  <div class="number">1</div>
                  <div class="text">{{ l.s('auth.install_app.android.step1') }}</div>
                </div>
                <div class="step">
                  <div class="number">2</div>
                  <div class="text">{{ l.s('auth.install_app.android.step2', { url: Config.ELYSIA_URL }) }}</div>
                </div>
                <div class="step">
                  <div class="number">3</div>
                  <div class="text">{{ l.s('auth.install_app.android.step3') }}</div>
                </div>
                <div class="store-buttons">
                  <a href="https://play.google.com/store/apps/details?id=cz.schoolingo.app" target="_blank" class="store-button">
                    <img src="assets/google-play-badge.png" alt="Get it on Google Play">
                  </a>
                </div>
              </div>
            } @else {
              <div class="steps">
                <div class="step">
                  <div class="number">1</div>
                  <div class="text">{{ l.s('auth.install_app.ios.step1') }}</div>
                </div>
                <div class="step">
                  <div class="number">2</div>
                  <div class="text">{{ l.s('auth.install_app.ios.step2', { url: Config.ELYSIA_URL }) }}</div>
                </div>
                <div class="step">
                  <div class="number">3</div>
                  <div class="text">{{ l.s('auth.install_app.ios.step3') }}</div>
                </div>
                <div class="store-buttons">
                  <a href="https://apps.apple.com/app/schoolingo/id123456789" target="_blank" class="store-button">
                    <img src="assets/app-store-badge.png" alt="Download on the App Store">
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.3s;
    }

    .tab:hover {
      background-color: var(--hover-bg);
    }

    .tab.active {
      background-color: var(--primary);
      color: white;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .text {
      line-height: 1.5;
    }

    .store-buttons {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
    }

    .store-button {
      display: inline-block;
      transition: transform 0.2s;
    }

    .store-button:hover {
      transform: scale(1.05);
    }

    .store-button img {
      height: 48px;
      width: auto;
    }
  `]
})
export class InstallAppModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  public l = inject(Locale);
  public Config = Config;
  activeTab: 'android' | 'ios' = 'android';

  close() {
    this.closeModal.emit();
  }
} 