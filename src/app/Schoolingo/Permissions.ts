import { Injectable } from '@angular/core';
import { UserRoles, modulePerm, UserPerms, permType } from './Permissions.d';
import { UserService } from './User';
import { PermissionsConfig } from './Permissions.config';
import { Utils } from './Utils';
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
            let perms: string[] = [];
            if (!Array.isArray(perm)) {
                perms = [perm];
            } else {
                perms = perm;
            }
            perms.forEach((permission: string) => {
                let permCount = 0;
                if (permission.startsWith("older:")) {
                    let age = parseInt(permission.slice(6));
                    if (Utils.getAge(user.birthday) >= age) {
                        permCount++;
                    }
                } else if (permission == "principal") {
                    if (user.isPrincipal) {
                        permCount++;
                    }
                } else if (permission == "all") {
                    permCount++;
                } else if (permission.startsWith("manager:")) {
                    if (user.manager == -1) {
                        permCount++;
                    }
                    let manPerm = permission.slice(8);
                    let id = PermissionsConfig.Managers.indexOf(manPerm);
                    let bin = (user.manager >>> 0).toString(2).split('').reverse();
                    if (id !== -1 && bin[id] && bin[id].toString() == "1") {
                        permCount++;
                    }
                } else {
                    if (permission == user.type) {
                        permCount++;
                    }
                }
                if (permCount == perms.length) {
                    count++;
                }
            });
        });
        return count > 0;
    }
}