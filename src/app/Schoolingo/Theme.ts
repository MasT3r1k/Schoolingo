import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { Cache } from "./Cache";
import { Logger } from "./Logger";

export type themes = 'system' | 'light' | 'dark';

@Injectable()
export class Theme {
    private logName: string = 'Theme';
    private cacheName: string = 'theme';
    private themeCache: string[] = [this.cache.settingsCacheName, this.cacheName];
    private renderer: Renderer2;
    private theme: themes = 'system';
    private themes: themes[] = ['system', 'dark', 'light'];

    constructor(
        private rendererFactory: RendererFactory2,
        private cache: Cache,
        private logger: Logger
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        logger.send(this.logName, 'Loading theme..')
        this.theme = this.cache.get(this.themeCache[0], this.themeCache[1]);

        if (!this.theme) {
            const isDark: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
            this.theme = isDark.matches ? 'dark' : 'light';
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (this.theme !== 'system') return; 
            this.updateTheme(event.matches ? "dark" : "light", false);
        });


        this.updateTheme(this.theme);
    }

    /**
     * Change theme
     * @param theme theme for website
     */
    public updateTheme(theme: themes, update: boolean = true): void {
        this.logger.send(this.logName, 'Theme set to ' + theme.toUpperCase() + '.');
        let obj: Record<string, string> = {};
        obj[this.themeCache[1]] = theme;
        this.cache.save(this.themeCache[0], obj);
        if (update) { this.theme = theme as themes }
        this.renderer.removeClass(document.body.parentElement, 'light');
        this.renderer.removeClass(document.body.parentElement, 'dark');
        // this.renderer.removeClass(document.body.parentElement, 'moonlight');
        if (theme !== 'system') { this.renderer.addClass(document.body.parentElement, theme) }
        else { this.renderer.addClass(document.body.parentElement, window.matchMedia("(prefers-color-scheme: dark)") ? 'dark' : 'light') }

    }

    public getTheme(): themes {
        return this.theme;
    }

    public getThemes(): themes[] {
        return this.themes;
    }

}