import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { Cache } from "./Cache";
import { Logger } from "./Logger";

export type themes = 'light' | 'dark' | 'moonlight';

@Injectable()
export class Theme {
    private logName: string = 'Theme';
    private themeCache: string[] = [this.cache.settingsCacheName, 'theme'];
    private renderer: Renderer2;
    constructor(
        private rendererFactory: RendererFactory2,
        private cache: Cache,
        private logger: Logger
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        logger.send(this.logName, 'Loading theme..')
        let theme = this.cache.get(this.themeCache[0], this.themeCache[1]);
        if (!theme) {
            const isDark: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
            this.updateTheme(isDark.matches ? 'dark' : 'light');
        }
    }

    /**
     * Change theme
     * @param theme theme for website
     */
    public updateTheme(theme: themes): void {
        this.logger.send(this.logName, 'Theme set to ' + theme.toUpperCase() + '.')
        this.renderer.addClass(document.body.parentElement, theme);

    }

}