import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { BehaviorSubject } from 'rxjs';

export type themes = 'system' | 'light' | 'dark' | 'moon';
export type themes_no_system = Omit<themes, 'system'>;
export type theme_categories = 'dark' | 'light';

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
  private categories: Record<theme_categories, themes_no_system[]> = {
    light: ['light'],
    dark: ['dark', 'moon']
  };

  public getThemeCategory(theme: themes_no_system): theme_categories | void {
    let entry = Object.entries(this.categories);
    for(const category of entry) {
      if (category[1].includes(theme)) return category[0] as theme_categories;
    }
    return;
  }

  public getThemesInCategory(category: theme_categories): themes_no_system[] {
    return this.categories[category];
  }
  
  
  private system_theme: [themes_no_system, themes_no_system] = [this.getThemesInCategory('light')[0], this.getThemesInCategory('dark')[0]];

  public getSystemTheme(category: theme_categories): themes_no_system {
    switch(category) {
      case "dark":
        return this.system_theme[1];
      case "light":
      default:
        return this.system_theme[0];
    }
  }

  public setSystemTheme(category: theme_categories, theme: themes_no_system): void {
    let index = 0;
    switch(category) {
      case "dark":
        index = 1;
        break;
      case "light":
      default:
        index = 0;
        break;
    }

    this.system_theme[index] = theme;
    if (this.theme.getValue() == "system") {
      this.updateTheme("system", false)
    }
  }

  
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
        this.updateTheme(this.system_theme[event.matches ? 1 : 0] as themes, false);
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

  public getSystemColor(): themes_no_system {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? this.system_theme[1]
      : this.system_theme[0];
  }

  public getThemeColorFromTheme(theme: themes): themes_no_system {
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

  public getThemeColor(): themes_no_system {
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
