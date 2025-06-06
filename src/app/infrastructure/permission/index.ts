import { inject, Injectable } from '@angular/core';
import { UserRoles, modulePerm, UserPerms, permType } from './perms';
import { PermissionsConfig } from './config';
import { Authentication } from '@Schoolingo/authentication';
import moment from 'moment';
export type { UserRoles, modulePerm, UserPerms, permType };

  export function getAge(date: moment.Moment): number {
    let age = 0;

    let now = moment().subtract(1, 'year');
    while(now.isSameOrAfter(date, 'day')) {
      age++;
      now.subtract(1, 'year');
    }

    return age;
  }

@Injectable()
export class Permission {

    private user = inject(Authentication);

    constructor(){}

    public checkPermission(required: permType[] = []): boolean {
        let user = this.user.getUser()!;
        let count = 0;

        if (!user || user.role == undefined) {
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

            let permCount = 0;
            perms.forEach((permission: string) => {
                permission = permission.toLowerCase();
                if (permission.startsWith("older:")) {
                    let age = parseInt(permission.slice(6));
                    if (getAge(user.birthday) >= age) {
                        permCount++;
                    }
                } else if (permission == "classteacher" && this.user.getUser().classes.length) {
                    permCount++;
                } else if (permission == "all") {
                    permCount++;
                } else if (permission == user.role) {
                    permCount++;
                }
            });

            if (permCount == perms.length) {
                count++;
            }
        });
        return count > 0;
    }
}