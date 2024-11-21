import { Injectable } from "@angular/core";
import { ModuleConfig, modules } from "./Modules.d";
import { modulesConfig } from "./Modules.config";
export { ModuleConfig, modules }

@Injectable()
export class Modules {
    
    private config: Record<string, ModuleConfig> = modulesConfig;
    private moduleActive: boolean[] = [true];

    // (this.moduleActive >>> 0).toString(2).split('');
    public checkModule(modules: modules[]): boolean {
        let isActive = true;
        let keys = Object.keys(this.config);
        console.log(modules)
        modules.forEach((module: modules) => {
            console.log(module)
            let index = keys.indexOf(module);
            console.log(index)
            if (index === -1) isActive = false;
            if (!this.moduleActive[index]) {
                isActive = false;
            }
        })
        console.log(isActive);
        return isActive;
    }

}