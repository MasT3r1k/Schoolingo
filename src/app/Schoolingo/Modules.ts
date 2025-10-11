import { Injectable } from "@angular/core";
import { ModuleConfig, modules } from "./Modules.d";
import { modulesConfig } from "./Modules.config";
export { ModuleConfig, modules }

@Injectable({ providedIn: 'root' })
export class Modules {
    
    private config: Record<string, ModuleConfig> = modulesConfig;
    private moduleActive: boolean[] = [];

    public setModules(data: number): void {
        (data >>> 0).toString(2).split('').forEach((bool: string) => {
            this.moduleActive.unshift(bool == "1" ? true : false);
        });
    }

    public checkModule(modules: modules[]): boolean {
        let isActive = true;
        let keys = Object.keys(this.config);
        modules.forEach((module: modules) => {
            let index = keys.indexOf(module);
            if (index === -1 || !this.moduleActive[index]) isActive = false;
        })
        return isActive;
    }

}