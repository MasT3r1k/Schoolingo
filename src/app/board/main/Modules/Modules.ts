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
            titles: [
                {
                    title: "sidebar/teach/homeworks",
                    link: ["", "teach", "homeworks"]
                }
            ],
            component: null
        },
        {
            titles: [
                {
                    title: "announcements",
                }
            ],
            component: AnnouncementsComponent
        },
        {
            titles: [
                {
                    title: "sidebar/marks/interm",
                    link: ["", "marks", "interm"]
                }
            ],
            component: IntermComponent
        },
        {
            titles: [
                {
                    title: "sidebar/teach/substitution",
                    link: ["", "teach", "substitution"]
                }
            ],
            component: SubstitutionComponent
        },
        {
            titles: [
                {
                    title: "sidebar/traineeship/main",
                    link: ["", "traineeship", "overview"]
                }
            ],
            modules: ['traineeship'],
            component: null
        },
        {
            titles: [
                {
                    title: "sidebar/canteen/menu",
                    link: ["", "canteen", "menu"]
                }
            ],
            modules: ['canteen'],
            component: null
        },
        {
            titles: [
                {
                    title: "sidebar/library/main",
                    link: ["", "library", "overview"]
                }
            ],
            modules: ['library'],
            component: null
        },
        {
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
