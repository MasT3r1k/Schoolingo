import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { Cache } from "./Cache";
import { Logger } from "./Logger";

export type themes = 'light' | 'dark' | 'moonlight';

@Injectable()
export class Theme {
    private logName: string = 'Theme';
    private cacheName: string = 'theme';
    private themeCache: string[] = [this.cache.settingsCacheName, this.cacheName];
    private renderer: Renderer2;
    private theme: themes = 'dark';
    constructor(
        private rendererFactory: RendererFactory2,
        private cache: Cache,
        private logger: Logger
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        logger.send(this.logName, 'Loading theme..')
        this.theme = this.cache.get(this.themeCache[0], this.themeCache[1]);
        if (!this.theme) {
            console.log(window);
            const isDark: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
            console.log(isDark)
            this.theme = isDark.matches ? 'dark' : 'light';
        }
        
        this.updateTheme(this.theme);
    }

    /**
     * Change theme
     * @param theme theme for website
     */
    public updateTheme(theme: themes): void {
        this.logger.send(this.logName, 'Theme set to ' + theme.toUpperCase() + '.');
        let obj: Record<string, string> = {};
        obj[this.themeCache[1]] = theme;
        this.cache.save(this.themeCache[0], obj)
        this.theme = theme as themes;
        this.renderer.removeClass(document.body.parentElement, 'light');
        this.renderer.removeClass(document.body.parentElement, 'dark');
        this.renderer.removeClass(document.body.parentElement, 'moonlight');
        this.renderer.addClass(document.body.parentElement, theme);

    }

    public getTheme(): themes {
        return this.theme;
    }

}