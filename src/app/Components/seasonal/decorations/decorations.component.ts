import { Component, inject } from '@angular/core';
import { SeasonalService } from '@Schoolingo/seasonal';

@Component({
  selector: 'app-seasonal-decorations',
  standalone: true,
  template: `
    @if (seasonalService.isActive() && seasonalService.getModeValue() === 'full') {
      <!-- Snowman in bottom right -->
      @if (seasonalService.getSeasonValue() === 'christmas') {
        <div class="decoration snowman">⛄</div>
        <div class="decoration tree">🎄</div>
        <div class="decoration gift">🎁</div>
        <div class="decoration gift2">🎀</div>
      }
      
      @if (seasonalService.getSeasonValue() === 'easter') {
        <div class="decoration easter-egg">🥚</div>
        <div class="decoration bunny">🐰</div>
        <div class="decoration flower">🌷</div>
      }
      
      @if (seasonalService.getSeasonValue() === 'summer') {
        <div class="decoration sun">☀️</div>
        <div class="decoration palm">🌴</div>
        <div class="decoration umbrella">⛱️</div>
      }
      
      @if (seasonalService.getSeasonValue() === 'graduation') {
        <div class="decoration cap">🎓</div>
        <div class="decoration diploma">📜</div>
        <div class="decoration star">⭐</div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .decoration {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      user-select: none;
      filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.2));
      animation: float 4s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    
    /* Christmas Decorations */
    .snowman {
      bottom: 30px;
      right: 50px;
      font-size: 120px;
      opacity: 0.35;
      animation-delay: 0s;
    }
    
    .tree {
      bottom: 20px;
      left: 40px;
      font-size: 100px;
      opacity: 0.3;
      animation-delay: 0.5s;
    }
    
    .gift {
      bottom: 30px;
      left: 160px;
      font-size: 60px;
      opacity: 0.25;
      animation-delay: 1s;
    }
    
    .gift2 {
      bottom: 140px;
      right: 45px;
      font-size: 50px;
      opacity: 0.2;
      animation-delay: 1.5s;
    }
    
    /* Easter Decorations */
    .easter-egg {
      bottom: 40px;
      right: 60px;
      font-size: 100px;
      opacity: 0.35;
      animation-delay: 0s;
    }
    
    .bunny {
      bottom: 50px;
      left: 50px;
      font-size: 90px;
      opacity: 0.3;
      animation-delay: 0.5s;
    }
    
    .flower {
      bottom: 30px;
      left: 170px;
      font-size: 60px;
      opacity: 0.25;
      animation-delay: 1s;
    }
    
    /* Summer Decorations */
    .sun {
      top: 100px;
      right: 60px;
      font-size: 100px;
      opacity: 0.3;
      animation-delay: 0s;
    }
    
    .palm {
      bottom: 30px;
      left: 40px;
      font-size: 110px;
      opacity: 0.3;
      animation-delay: 0.5s;
    }
    
    .umbrella {
      bottom: 40px;
      right: 50px;
      font-size: 90px;
      opacity: 0.25;
      animation-delay: 1s;
    }
    
    /* Graduation Decorations */
    .cap {
      bottom: 40px;
      right: 60px;
      font-size: 110px;
      opacity: 0.35;
      animation-delay: 0s;
    }
    
    .diploma {
      bottom: 50px;
      left: 50px;
      font-size: 90px;
      opacity: 0.3;
      animation-delay: 0.5s;
    }
    
    .star {
      top: 150px;
      right: 100px;
      font-size: 70px;
      opacity: 0.25;
      animation-delay: 1s;
    }
    
    /* Responsive - hide on small screens */
    @media (max-width: 768px) {
      .decoration {
        display: none;
      }
    }
    
    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .decoration {
        animation: none;
      }
    }
  `]
})
export class SeasonalDecorationsComponent {
  public seasonalService = inject(SeasonalService);
}
