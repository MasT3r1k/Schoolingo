import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type themes = 'system' | 'light' | 'dark';

@Injectable()
export class Theme {
  private logName: string = 'Theme';
  private cacheName: string = 'theme';
  private themeCache: string[] = [
    this.cacheName,
  ];
  private renderer: Renderer2;
  private theme = new BehaviorSubject<themes>('system');
  private themes: themes[] = ['system', 'dark', 'light'];

  constructor(
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    if (!this.theme) {
      this.theme = new BehaviorSubject<themes>('system');
    }
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        if (this.theme.getValue() !== 'system') {
          return;
        }
        this.updateTheme(event.matches ? 'dark' : 'light', false);
      });

    this.updateTheme(this.theme.getValue());
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
  }

  public getSystemColor(): "dark" | "light" {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /**
   * Change theme
   * @param theme theme for website
   */
  public updateTheme(theme: themes, update: boolean = true): void {
    let obj: Record<string, string> = {};
    obj[this.themeCache[1]] = theme;
    if (update) {
      this.theme.next(theme);
    }
    this.renderer.removeClass(document.body.parentElement, 'light');
    this.renderer.removeClass(document.body.parentElement, 'dark');
    // this.renderer.removeClass(document.body.parentElement, 'moonlight');
    if (theme !== 'system') {
      this.renderer.addClass(document.body.parentElement, theme);
    } else {
      this.renderer.addClass(
        document.body.parentElement,
        this.getSystemColor()
      );
    }
  }

  public getTheme(): typeof this.theme {
    return this.theme;
  }

  public getThemeColor(): Omit<themes, "system"> {
    return this.theme.getValue() == 'system' ? this.getSystemColor() : this.theme.getValue();
  }

  public getThemes(): themes[] {
    return this.themes;
  }
}