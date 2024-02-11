import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Storage } from './Storage';
import { Logger } from './Logger';

export type themes = 'system' | 'light' | 'dark';

@Injectable()
export class Theme {
  private logName: string = 'Theme';
  private cacheName: string = 'theme';
  private themeCache: string[] = [
    this.storage.settingsCacheName,
    this.cacheName,
  ];
  private renderer: Renderer2;
  private theme: themes = 'system';
  private themes: themes[] = ['system', 'dark', 'light'];

  constructor(
    private rendererFactory: RendererFactory2,
    private storage: Storage,
    private logger: Logger
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    logger.send(this.logName, 'Loading theme..');
    this.theme = this.storage.get(this.themeCache[0], this.themeCache[1]);

    if (!this.theme) {
      this.theme = this.getSystemColor();
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        if (this.theme !== 'system') {
          return;
        }
        this.updateTheme(event.matches ? 'dark' : 'light', false);
      });

    this.updateTheme(this.theme);
  }

  public getSystemColor(): themes {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /**
   * Change theme
   * @param theme theme for website
   */
  public updateTheme(theme: themes, update: boolean = true): void {
    this.logger.send(this.logName, 'Theme set to ' + theme.toUpperCase() + '.');
    let obj: Record<string, string> = {};
    obj[this.themeCache[1]] = theme;
    this.storage.save(this.themeCache[0], obj);
    if (update) {
      this.theme = theme as themes;
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

  public getTheme(): themes {
    return this.theme;
  }

  public getThemes(): themes[] {
    return this.themes;
  }
}
