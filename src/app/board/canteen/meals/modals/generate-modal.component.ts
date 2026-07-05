import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-canteen-generate-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent, IconsModule],
  template: `
    <!-- Form State -->
    <ng-container *ngIf="!isGenerating && !generationResult">
      <div class="modal-body animate-fade-in" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;" [innerHTML]="l.s('canteen.generate_menu_desc')">
        </div>
        
        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.375rem;">
          <label class="form-label" style="font-weight: 500;">{{ l.s('canteen.target_kcal_limit') }}</label>
          <input type="number" class="form-input" min="500" max="10000" [(ngModel)]="genForm.target_kcal">
          <small style="color: var(--text-muted); font-size: 0.75rem;">{{ l.s('canteen.target_kcal_hint') }}</small>
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.375rem;">
          <label class="form-label" style="font-weight: 500;">{{ l.s('canteen.num_variants') }}</label>
          <schoolingo-dropdown [options]="variantOptions" [(ngModel)]="genForm.variants" [settings]="{ locale: false }" style="width: 100%;"></schoolingo-dropdown>
        </div>
      </div>
      <div class="modal-actions animate-fade-in" style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('buttons.cancel') || 'Zrušit' }}</button>
        <button class="btn btn--primary" (click)="runGenerator()">
          <i-tabler name="wand" style="width: 16px; height: 16px; margin-right: 4px;"></i-tabler>
          {{ l.s('canteen.run_generation') }}
        </button>
      </div>
    </ng-container>

    <!-- Generating Loader State -->
    <ng-container *ngIf="isGenerating && !generationResult">
      <div class="generator-loading-container animate-fade-in">
        <div class="magic-wand-wrap">
          <i-tabler name="wand" class="wand-icon"></i-tabler>
          <div class="sparkle sp-1">✦</div>
          <div class="sparkle sp-2">✦</div>
          <div class="sparkle sp-3">✦</div>
          <div class="sparkle sp-4">✦</div>
        </div>

        <h3 class="generator-loading-title">{{ l.s('canteen.generate_menu_loading_title') }}</h3>

        <!-- Food slot machine effect -->
        <div class="food-evaluator">
          <span class="eval-label">{{ l.s('canteen.generate_menu_evaluating') }}:</span>
          <span class="eval-value">{{ evaluatingFood }}</span>
        </div>

        <!-- Progress Steps -->
        <div class="generation-steps">
          <div class="step-item" *ngFor="let s of steps; let idx = index" [class.active]="currentStep === idx" [class.done]="s.done">
            <span class="step-icon">
              <i-tabler *ngIf="s.done" name="circle-check" class="check-success"></i-tabler>
              <span *ngIf="!s.done && currentStep === idx" class="spinner-mini"></span>
              <i-tabler *ngIf="!s.done && currentStep !== idx" name="circle" class="circle-muted"></i-tabler>
            </span>
            <span class="step-text">{{ s.label }}</span>
          </div>
        </div>

        <!-- Overall progress bar using standard .mt-progress -->
        <div class="mt-progress" style="width: 100%;">
          <div class="mt-progress__bar" style="background: linear-gradient(90deg, var(--primary, #6366f1), var(--success, #10b981));" [style.width.%]="getProgressPercentage()"></div>
        </div>
      </div>
    </ng-container>

    <!-- Result State (Success or Error) -->
    <ng-container *ngIf="generationResult">
      <div class="generator-result-container animate-pop-in" [class.success]="generationResult === 'success'" [class.error]="generationResult === 'error'">
        <div class="result-icon-wrap">
          <i-tabler *ngIf="generationResult === 'success'" name="circle-check" class="res-icon success-color"></i-tabler>
          <i-tabler *ngIf="generationResult === 'error'" name="circle-x" class="res-icon error-color"></i-tabler>
        </div>

        <h3 class="result-title">
          {{ generationResult === 'success' ? l.s('canteen.generate_menu_success') : l.s('canteen.generate_menu_error') }}
        </h3>
        
        <p class="result-desc">
          {{ generationResult === 'success' ? l.s('canteen.generate_menu_success_desc') : l.s('canteen.generate_menu_error_desc') }}
        </p>

        <div class="modal-actions" style="margin-top: 2rem; justify-content: center; width: 100%;">
          <button class="btn" [class.btn--primary]="generationResult === 'success'" [class.btn--danger]="generationResult === 'error'" (click)="finishGeneration()">
            {{ generationResult === 'success' ? l.s('canteen.generate_menu_btn_success') : l.s('canteen.generate_menu_btn_error') }}
          </button>
        </div>
      </div>
    </ng-container>
  `,
  styleUrl: './generate-modal.component.css'
})
export class CanteenGenerateModalComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public l = inject(Locale);

  public startDate = '';
  public genForm = {
    target_kcal: 3500,
    variants: 2
  };

  public variantOptions: { label: string, value: number }[] = [];

  // Loader & animation states
  public isGenerating = false;
  public generationResult: 'success' | 'error' | null = null;
  public currentStep = 0;
  public evaluatingFood = '';

  public steps: { label: string; done: boolean }[] = [];

  private foodList = [
    'Svíčková na smetaně', 'Rajská omáčka s těstovinami', 'Zapečené těstoviny',
    'Kuřecí řízek, kaše', 'Čočka na kyselo, vejce', 'Koprová omáčka, knedlík',
    'Krupicová kaše s kakaem', 'Boloňské špagety', 'Hrachová kaše, párek',
    'Vepřo-knedlo-zelo', 'Španělský ptáček, rýže', 'Guláš s knedlíkem',
    'Pečené kuřecí stehno', 'Ovocné kynuté knedlíky', 'Rybí filé na másle',
    'Dukátové buchtičky', 'Smažený sýr, hranolky', 'Risotto se zeleninou'
  ];

  private foodInterval: any;
  private apiDone = false;
  private apiError = false;
  private animDone = false;

  ngOnInit(): void {
    this.variantOptions = [
      { label: this.l.s('canteen.variant_option_1'), value: 1 },
      { label: this.l.s('canteen.variant_option_2'), value: 2 }
    ];

    const data = this.modalManager.getModalData('canteen-generate-modal');
    if (data) {
      this.startDate = data.startDate;
    }
  }

  ngOnDestroy(): void {
    this.clearAnimationIntervals();
  }

  runGenerator() {
    const payload = {
      start_date: this.startDate,
      target_kcal: this.genForm.target_kcal,
      variants: this.genForm.variants
    };

    // Initialize loading steps
    this.steps = [
      { label: this.l.s('canteen.generate_menu_step_1'), done: false },
      { label: this.l.s('canteen.generate_menu_step_2'), done: false },
      { label: this.l.s('canteen.generate_menu_step_3'), done: false },
      { label: this.l.s('canteen.generate_menu_step_4'), done: false }
    ];
    this.isGenerating = true;
    this.generationResult = null;
    this.apiDone = false;
    this.apiError = false;
    this.animDone = false;

    // Start cycling evaluation text
    let foodIdx = 0;
    this.evaluatingFood = this.foodList[0];
    this.foodInterval = setInterval(() => {
      foodIdx = (foodIdx + 1) % this.foodList.length;
      this.evaluatingFood = this.foodList[foodIdx];
    }, 120);

    // Call API immediately
    this.http.post(`${Config.API_URL}/v1/canteen/menu/generate`, payload, { withCredentials: true })
      .subscribe({
        next: () => {
          this.apiDone = true;
          this.checkIfFinished();
        },
        error: (err) => {
          console.error('Chyba generátoru', err);
          this.apiDone = true;
          this.apiError = true;
          this.checkIfFinished();
        }
      });

    // Start simulated visual steps to provide feedback
    this.animateSteps();
  }

  private animateSteps() {
    const stepDelay = 650;
    let step = 0;

    const next = () => {
      if (step < this.steps.length) {
        this.currentStep = step;
        setTimeout(() => {
          this.steps[step].done = true;
          step++;
          next();
        }, stepDelay);
      } else {
        this.animDone = true;
        this.clearAnimationIntervals();
        this.checkIfFinished();
      }
    };

    next();
  }

  private checkIfFinished() {
    if (this.apiDone && this.animDone) {
      if (this.apiError) {
        this.generationResult = 'error';
      } else {
        this.generationResult = 'success';
      }
    }
  }

  private clearAnimationIntervals() {
    if (this.foodInterval) {
      clearInterval(this.foodInterval);
      this.foodInterval = null;
    }
  }

  getProgressPercentage(): number {
    if (!this.steps || this.steps.length === 0) return 0;
    const doneCount = this.steps.filter(s => s.done).length;
    return (doneCount / this.steps.length) * 100;
  }

  finishGeneration() {
    if (this.generationResult === 'success') {
      const data = this.modalManager.getModalData('canteen-generate-modal');
      if (data?.refreshCallback) {
        data.refreshCallback();
      }
    }
    this.modalManager.closeModal('canteen-generate-modal');
  }

  closeModal() {
    this.modalManager.closeModal('canteen-generate-modal');
  }
}
