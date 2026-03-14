import { Injectable } from '@angular/core';
import { createAvatar } from '@dicebear/core';
import { 
    adventurer, 
    avataaars, 
    bottts, 
    lorelei, 
    openPeeps, 
    pixelArt, 
    thumbs,
    initials
} from '@dicebear/collection';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
    private collections: any = {
        adventurer,
        avataaars,
        bottts,
        lorelei,
        openPeeps,
        pixelArt,
        thumbs,
        initials
    };

    /**
     * Generates a DiceBear avatar Data URI based on the provided avatar config and backup seed.
     * @param avatarConfig The avatar configuration object (can be a JSON string or an object)
     * @param backupSeed A backup seed (usually username or fullName) if the config doesn't have a seed.
     * @returns A Data URI string of the generated avatar.
     */
    public getAvatar(avatarConfig: any, backupSeed: string): string {
        let config: any = {};
        
        if (typeof avatarConfig === 'string') {
            try {
                config = JSON.parse(avatarConfig);
            } catch (e) {
                config = {};
            }
        } else if (avatarConfig && typeof avatarConfig === 'object') {
            config = avatarConfig;
        }

        const options: any = {};
        if (config) {
            Object.keys(config).forEach(key => {
                const val = config[key];
                const isColorKey = key.toLowerCase().includes('color') || key === 'backgroundColor';
                const isVariantKey = ['eyes', 'face', 'mouth'].includes(key);

                if (typeof val === 'string' && (isColorKey || isVariantKey)) {
                    options[key] = [val];
                } else {
                    options[key] = val;
                }
            });
        }

        if (!options.seed) options.seed = backupSeed;

        const avatar = createAvatar(this.collections[config?.type] || thumbs, options);

        return avatar.toDataUri().toString();
    }
}
