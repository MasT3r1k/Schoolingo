import { BehaviorSubject } from 'rxjs';
import { Module, ModuleTitle } from './Modules.d';
import { TimetableComponent } from './Timetable/Timetable';
import { BackpackComponent } from './Backpack/Backpack';
import { IntermComponent } from './Interm/Interm';
import { AnnouncementsComponent } from './Announcements/Announcements';
import { SubstitutionComponent } from './Substitution/Substitution';
import { Modules } from '@Schoolingo/Modules';
import { Injectable } from '@angular/core';
export { Module, ModuleTitle };

@Injectable()
export class MainModules {

    constructor(
        public moduleManager: Modules
    ) {}

    public modules: Module[] = [
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/teach/timetable",
                    link: ["", "teach", "timetable"]
                },
                {
                    title: "backpack"
                }
            ],
            component: [TimetableComponent, BackpackComponent]
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/teach/homeworks",
                    link: ["", "teach", "homeworks"]
                }
            ],
            perms: ['student', 'parent'],
            component: null
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "announcements",
                }
            ],
            component: AnnouncementsComponent
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/marks/interm",
                    link: ["", "marks", "interm"]
                }
            ],
            perms: ['student', 'parent'],
            component: IntermComponent
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/teach/substitution",
                    link: ["", "teach", "substitution"]
                }
            ],
            component: SubstitutionComponent
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/traineeship/main",
                    link: ["", "traineeship", "overview"]
                }
            ],
            perms: ['student', 'parent'],
            modules: ['traineeship'],
            component: null
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/canteen/menu",
                    link: ["", "canteen", "menu"]
                }
            ],
            modules: ['canteen'],
            perms: ['student', 'parent'],
            component: null
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/library/main",
                    link: ["", "library", "loans"]
                }
            ],
            modules: ['library'],
            component: null
        },
        {
            selectedTab: new BehaviorSubject(0),
            titles: [
                {
                    title: "sidebar/actionPlan",
                    link: ["", "actionplan"]
                }
            ],
            component: null
        }
    ];
}
