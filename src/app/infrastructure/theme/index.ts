import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { BehaviorSubject } from 'rxjs';

export type themes = 'system' | 'light' | 'dark' | 'moon';

@Injectable()
export class Theme {
  private logName: string = 'Theme';
  private cacheName: string = 'theme';
  private themeCache: string[] = [this.cacheName];
  private renderer: Renderer2;
  private auth = inject(Authentication)
  private http = inject(HttpClient);

  private theme = new BehaviorSubject<themes>('system');
  private themes: themes[] = ['system', 'dark', 'moon', 'light'];

  private action: 'selected' | 'saving' | 'error' = 'selected';

  constructor(private rendererFactory: RendererFactory2) {
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
    this.auth.getAuthState().subscribe((state) => {
      if (state == true) {
        const user = this.auth.getUser();
        if (user && 'theme' in user) {
          const themeIndex = user.theme;
          const theme = this.themes[themeIndex] || this.theme.getValue();
          this.updateTheme(theme);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
  }

  public getSystemColor(): Omit<themes, 'system'> {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  public getThemeColorFromTheme(theme: themes): Omit<themes, 'system'> {
    return theme == 'system' ? this.getSystemColor() : theme;
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
      this.saveTheme(theme);
    }
    this.themes.forEach((theme) => {
      this.renderer.removeClass(document.body.parentElement, theme);
    })
    this.renderer.addClass(
      document.body.parentElement,
      this.getThemeColor().toString()
    );
  }

  public getTheme(): typeof this.theme {
    return this.theme;
  }

  public getThemeColor(): Omit<themes, 'system'> {
    return this.theme.getValue() == 'system'
      ? this.getSystemColor()
      : this.theme.getValue();
  }

  public getThemes(): themes[] {
    return this.themes;
  }

  public getAction(): typeof this.action {
    return this.action;
  }

  public saveTheme(theme: themes): void {
    if (this.auth.getAuthStateValue() !== true) { return }
    this.action = 'saving';
    this.http
      .post(
        `${Config.API_URL}/v1/user/update`,
        {
          method: 'UPDATE_THEME',
          theme: this.themes.indexOf(theme),
        },
        { withCredentials: true }
      )
      .subscribe((data: any) => {
        if ('status' in data && data.status == true) {
          this.action = 'selected';
        }

        if ('error' in data) {
          this.action = 'error';
        }
      });
  }
}
