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
        'open-peeps': openPeeps,
        openPeeps,
        'pixel-art': pixelArt,
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
        
        if (typeof avatarConfig === 'string' && (avatarConfig.startsWith('http') || avatarConfig.startsWith('/') || avatarConfig.startsWith('./') || avatarConfig.includes('.'))) {
            return avatarConfig;
        }

        if (typeof avatarConfig === 'string') {
            try {
                config = JSON.parse(avatarConfig);
            } catch (e) {
                config = {};
            }
        } else if (avatarConfig && typeof avatarConfig === 'object') {
            config = avatarConfig;
        }

        const props: any = {};
        if (config) {
            // Support for backend format { collection: string, options: object }
            const type = config.type || config.collection;
            const options = config.options || {};
            
            // Merge all properties
            const mergedConfig = { ...config, ...options };
            if (type) mergedConfig.type = type;

            Object.keys(mergedConfig).forEach(key => {
                if (key === 'type' || key === 'collection' || key === 'options') return;
                const val = mergedConfig[key];
                
                const singleValueProps = ['radius', 'rotate', 'size', 'scale', 'flip', 'faceOffsetX', 'faceOffsetY', 'shapeOffsetX', 'shapeOffsetY', 'translateX', 'translateY', 'seed'];
                if (singleValueProps.includes(key)) {
                    props[key] = val;
                } else if (typeof val === 'string') {
                    let finalVal = val;
                    // Fix for thumbs eyes (needs W suffix in v9)
                    if ((type === 'thumbs' || !type) && key === 'eyes' && !val.includes('W')) {
                        finalVal = val + 'W12';
                    }
                    props[key] = [finalVal];
                } else {
                    props[key] = val;
                }
            });
            
            if (type) config.type = type; // Ensure type is set for later use
        }

        if (!props.seed) props.seed = backupSeed;

        // Ensure default colors for thumbs if missing
        if (config.type === 'thumbs' || !config.type) {
            if (!props['eyesColor']) props['eyesColor'] = ['000000'];
            if (!props['mouthColor']) props['mouthColor'] = ['000000'];
        }

        if (!props.radius) props.radius = 50;

        const avatar = createAvatar(this.collections[config?.type] || thumbs, props);

        return avatar.toDataUri().toString();
    }
}
