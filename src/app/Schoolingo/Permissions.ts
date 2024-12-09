import { Injectable } from '@angular/core';
import { UserRoles, modulePerm, UserPerms, permType } from './Permissions.d';
import { UserService } from './User';
import { PermissionsConfig } from './Permissions.config';
export type { UserRoles, modulePerm, UserPerms, permType };

@Injectable()
export class Permission {

    constructor(
        private userService: UserService
    ){}

    public checkPermission(required: permType[] = []): boolean {
        let user = this.userService.getUser()!;
        let count = 0;

        if (!user || user.type == undefined) {
            return false;
        }

        if (required.length == 0 || required.includes("all")) {
            return true;
        }

        required.forEach((perm: permType) => {
            if (perm.startsWith("manager:")) {

                if (user.manager == -1) {
                    count++;
                }
                let manPerm = perm.slice(8);
                let id = PermissionsConfig.Managers.indexOf(manPerm);
                let bin = (user.manager >>> 0).toString(2).split('').reverse();
                if (id !== -1 && bin[id] && bin[id].toString() == "1") {
                    count++;
                    return;
                }
            } else {
                if (perm == user.type) {
                    count++;
                    return;
                }
            }
        });
        return count > 0;
    }
}