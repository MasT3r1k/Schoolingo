import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, Renderer2 } from '@angular/core';
import { SeasonalService } from '@Schoolingo/seasonal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-snow-effect',
  standalone: true,
  template: `
    <div #snowContainer class="snow-container" id="snowContainer"></div>
  `,
  styles: [`
    .snow-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 90;
      overflow: hidden;
      display: block; /* Ensure it works */
      height: 100vh; /* Explicit height */
      width: 100vw; /* Explicit width */
    }

    .snowflake {
      position: absolute;
      top: -10px;
      color: #e0f2fe; /* Light blue-white for better visibility */
      font-size: 1em;
      animation: fall linear infinite;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.8); /* Dark shadow for contrast */
    }

    :host-context(.light) .snowflake {
      color: #8ca6bd; /* Grayish blue for light mode */
      text-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 0 5px rgba(140, 166, 189, 0.4);
    }

    @keyframes fall {
      to {
        transform: translateY(100vh) translateX(var(--drift));
        opacity: 0;
      }
    }
  `]
})
export class SnowEffectComponent implements OnInit, OnDestroy {
  @ViewChild('snowContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private seasonalService = inject(SeasonalService);
  private renderer = inject(Renderer2);

  private intervalId: any = null;
  private modeSubscription: Subscription | null = null;

  ngOnInit(): void {
    // Don't run if reduced motion is preferred
    if (this.seasonalService.hasReducedMotion()) {
      return;
    }

    // Only run in full mode
    if (this.seasonalService.getModeValue() !== 'full') {
      return;
    }

    this.startSnow();

    // Listen for mode changes
    this.modeSubscription = this.seasonalService.getMode().subscribe((mode) => {
      if (mode !== 'full') {
        this.stopSnow();
      } else if (!this.intervalId && !this.seasonalService.hasReducedMotion()) {
        this.startSnow();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopSnow();
    if (this.modeSubscription) {
      this.modeSubscription.unsubscribe();
    }
  }

  private startSnow(): void {
    if (this.intervalId) return;

    // Počáteční burst 20 vloček
    for (let i = 0; i < 20; i++) {
      setTimeout(() => this.createSnowflake(), i * 100);
    }

    // Vytvářet vločky každých 300ms
    this.intervalId = setInterval(() => this.createSnowflake(), 350);
  }

  private stopSnow(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clean up existing snowflakes
    if (this.containerRef && this.containerRef.nativeElement) {
      this.containerRef.nativeElement.innerHTML = '';
    }
  }

  private createSnowflake(): void {
    if (!this.containerRef) return;

    const container = this.containerRef.nativeElement;
    const snowflake = this.renderer.createElement('div');
    this.renderer.addClass(snowflake, 'snowflake');
    this.renderer.setProperty(snowflake, 'textContent', '❄');

    // Random starting position (0% - 100% šířky)
    this.renderer.setStyle(snowflake, 'left', Math.random() * 100 + '%');

    // Random size (0.5em to 1.5em)
    const size = Math.random() * 0.9 + 0.25;
    this.renderer.setStyle(snowflake, 'fontSize', size + 'em');

    // Random opacity (0.3 to 0.9)
    this.renderer.setStyle(snowflake, 'opacity', Math.random() * 0.6 + 0.3);

    // Random duration (8s to 15s) - různé rychlosti padání
    const duration = Math.random() * 7 + 8;
    this.renderer.setStyle(snowflake, 'animationDuration', duration + 's');

    // Random horizontal drift (-50px to +50px)
    const drift = (Math.random() - 0.5) * 100;
    // Set custom property directly on the element style
    snowflake.style.setProperty('--drift', drift + 'px');

    // Přidat do DOM
    this.renderer.appendChild(container, snowflake);

    // Odstranit po dokončení animace (úspora paměti)
    setTimeout(() => {
      if (snowflake && snowflake.parentNode === container) {
        this.renderer.removeChild(container, snowflake);
      }
    }, duration * 1000);
  }
}
