import { Injectable } from '@angular/core';
import { Logger } from './Logger';
import { UserRoles, modulePerm, UserPerms, permType } from './Permissions.d';
import { SocketService } from './Socket';
import { UserService } from './User';
export type { UserRoles, modulePerm, UserPerms, permType };

@Injectable()
export class Permission {

    constructor(
        private socketService: SocketService,
        private logger: Logger,
        private userService: UserService
    ){}

    private userPerm: UserPerms = {
        role: 'student',
        class: 1
    };

    public getUserPermissions(): void {
        if (!this.socketService.socket?.connected) {
            this.logger.send("Perms", "Failed to get perms. No socket found.");
            return;
        }
        this.socketService.socket.emit('getUserPermissions');
    }

    public checkPermission(required: permType[] = []): boolean {
        let user = this.userService.getUser();
        
        if (!user || user.type == undefined) {
            return false;
        }
        if (required.length == 0) {
            return true;
        }
        if (required.includes(user.type) || required.includes('all')) {
            return true;
        }
        return false;
    }
}