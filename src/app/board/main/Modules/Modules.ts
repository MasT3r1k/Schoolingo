import { BehaviorSubject } from 'rxjs';
import { Module, ModuleTitle } from './Modules.d';
import { TimetableComponent } from './Timetable/Timetable';
import { BackpackComponent } from './Backpack/Backpack';
import { IntermComponent } from './Interm/Interm';
export { Module, ModuleTitle };

export class Modules {

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
            component: null
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
            component: null
        },
        {
            titles: [
                {
                    title: "sidebar/traineeship/main",
                    link: ["", "traineeship", "main"]
                }
            ],
            component: null
        },
        {
            titles: [
                {
                    title: "sidebar/canteen/menu",
                    link: ["", "canteen", "menu"]
                }
            ],
            component: null
        }
    ];
}
