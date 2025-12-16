import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { SeasonalService } from '@Schoolingo/seasonal';
import { Subscription } from 'rxjs';

/**
 * Snow particle for animation
 */
interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

@Component({
  selector: 'app-snow-effect',
  standalone: true,
  template: `
    <div class="snow-effect-container">
      <canvas #snowCanvas></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      pointer-events: none;
      z-index: 200;
      overflow: hidden;
    }
    
    .snow-effect-container {
      width: 100%;
      height: 100%;
    }
    
    canvas {
      width: 100%;
      height: 100%;
    }
  `]
})
export class SnowEffectComponent implements OnInit, OnDestroy {
  @ViewChild('snowCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private seasonalService = inject(SeasonalService);
  
  private ctx: CanvasRenderingContext2D | null = null;
  private snowflakes: Snowflake[] = [];
  private animationId: number | null = null;
  private isRunning = false;
  private stopTimeout: ReturnType<typeof setTimeout> | null = null;
  
  private SNOWFLAKE_COUNT = 50;
  private ANIMATION_DURATION = 0; // 0 = run continuously
  
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
    
    this.initCanvas();
    this.createSnowflakes();
    this.startAnimation();
    
    // Listen for mode changes
    this.modeSubscription = this.seasonalService.getMode().subscribe((mode) => {
      if (mode !== 'full') {
        this.stopAnimation();
      } else if (!this.isRunning && !this.seasonalService.hasReducedMotion()) {
        this.createSnowflakes();
        this.startAnimation();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
    }
    if (this.modeSubscription) {
      this.modeSubscription.unsubscribe();
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    
    // Set canvas size
    this.resizeCanvas();
    
    // Handle resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private createSnowflakes(): void {
    this.snowflakes = [];
    const canvas = this.canvasRef.nativeElement;
    
    for (let i = 0; i < this.SNOWFLAKE_COUNT; i++) {
      this.snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -50,
        radius: Math.random() * 3 + 1.5,
        speed: Math.random() * 0.8 + 0.4,
        opacity: Math.random() * 0.4 + 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  private startAnimation(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  private stopAnimation(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clear canvas
    if (this.ctx) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private animate(): void {
    if (!this.isRunning || !this.ctx) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update each snowflake
    for (const flake of this.snowflakes) {
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      this.ctx.fill();
      
      // Update position
      flake.y += flake.speed;
      flake.wobble += flake.wobbleSpeed;
      flake.x += Math.sin(flake.wobble) * 0.3;
      
      // Reset if out of bounds
      if (flake.y > canvas.height) {
        flake.y = -5;
        flake.x = Math.random() * canvas.width;
      }
      
      // Wrap horizontally
      if (flake.x < 0) {
        flake.x = canvas.width;
      } else if (flake.x > canvas.width) {
        flake.x = 0;
      }
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}
