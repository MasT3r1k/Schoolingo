import { BehaviorSubject } from 'rxjs';
import { Module, ModuleTitle } from './Modules.d';
import { TimetableComponent } from './Timetable/Timetable';
import { BackpackComponent } from './Backpack/Backpack';
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
            component: TimetableComponent
        },
        {
            titles: [
                {
                    title: "announcements",
                }
            ],
            component: TimetableComponent
        },
        {
            titles: [
                {
                    title: "sidebar/marks/interm",
                    link: ["", "marks", "interm"]
                }
            ],
            component: TimetableComponent
        },
        {
            titles: [
                {
                    title: "sidebar/teach/substitution",
                    link: ["", "teach", "substitution"]
                }
            ],
            component: TimetableComponent
        },
        {
            titles: [
                {
                    title: "sidebar/traineeship/main",
                    link: ["", "traineeship", "main"]
                }
            ],
            component: TimetableComponent
        },
        {
            titles: [
                {
                    title: "sidebar/canteen/menu",
                    link: ["", "canteen", "menu"]
                }
            ],
            component: TimetableComponent
        }
    ];
}
