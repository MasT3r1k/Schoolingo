import { createAvatar, Result } from '@dicebear/core';
import { avataaarsNeutral } from '@dicebear/collection';

export class Avatar {
    public declare avatar: Result;
    constructor() {
        this.avatar = createAvatar(avataaarsNeutral, {
            seed: 'John Doe',
            // ... other options
        });
    }
    public getAvatar(): string {
        return this.avatar.toDataUri()
    }
}