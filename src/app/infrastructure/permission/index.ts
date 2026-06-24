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

    public checkPermission(required: permType[] = [], class_name: string = ''): boolean {
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
                } else if (permission.startsWith("manager:")) {
                    if (user.manager == -1) {
                        permCount++;
                    } else {
                        let manPerm = permission.slice(8);
                        let id = PermissionsConfig.Managers.indexOf(manPerm);
                        let bin = (user.manager >>> 0).toString(2).split('').reverse();
                        if (id !== -1 && bin[id] && bin[id].toString() == "1") {
                            permCount++;
                        }
                    }
                } else if (permission == "principal" && user.principal == true) {
                    permCount++;
                } else if (permission == "classteacher" && user.role == "teacher" && user.classes.length) {
                    permCount++;
                } else if (permission.startsWith("classteacher:") && user.role == "teacher" && user.classes.length) {
                    let className = permission.slice(13);
                    if (className == '') {
                        className = class_name;
                    }
                    const hasClass = user.classes.find((cl) => cl.class_name == className);
                    if (hasClass) {
                        permCount++;
                    }
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