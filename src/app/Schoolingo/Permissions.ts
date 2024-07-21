import { Injectable } from '@angular/core';
import { Logger } from './Logger';
import { UserRoles, modulePerm, UserPerms, permType } from './Permissions.d';
import { SocketService } from './Socket';
export type { UserRoles, modulePerm, UserPerms, permType };

@Injectable()
export class Permission {

    constructor(
        private socketService: SocketService,
        private logger: Logger
    ){}

    private userPerm: UserPerms = {
        role: 'student',
        class: 1
    };

    public getUserPermissions(): void {
        if (!this.socketService.socket?.connected) {
            return this.logger.send("Perms", "Failed to get perms. No socket found.");
        }
        this.socketService.socket.emit('getUserPermissions');
    }

    public checkPermission(required: permType[] = []): boolean {
        if (this.userPerm.role == null) {
            return false;
        }
        if (required.length == 0) {
            return true;
        }
        if (required.includes(this.userPerm.role) || required.includes('all')) {
            return true;
        }
        return false;
    }
}