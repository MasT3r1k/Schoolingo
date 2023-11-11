import { Injectable } from "@angular/core";
import { UserService } from "./User";
import { UserMain, UserPermissions } from "./User.d";
import { Subject } from "./Board.d";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";
import { SocketService } from "./Socket";

// Add getWeek function to Date
declare global {
    interface Date {
        getWeek: Function;
    }
}

Date.prototype.getWeek = function() {
    var d: Date = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 8.64e7) + 1) / 7);
};


@Injectable()
export class Schoolingo {

    //?-- Main
    ///.-- INTERVALS
    private intervals: Record<string, any> = {};
    private tempData: Record<string, any> = {};
    constructor(
        private userService: UserService,
        private sidebar: Sidebar,
        private socketService: SocketService
    ) {
        // Listening for changes of connection to network
        window.addEventListener("offline", (e) => {
            this.wifiConnection = false;
        });
            
        window.addEventListener("online", (e) => {
            this.wifiConnection = true;
        });

        setInterval(() => {
            // Updating this today :)
            this.today = new Date();
            this.thisWeek = this.today.getWeek();
        }, 1000);
    }

    //?-- Functions

    ///.-- Refresh connection
    public refreshConnection(): void {
        let firstIntervalName  = 'refreshConnectionFirstInterval';
        let secondIntervalName = 'refreshConnectionSeconInterval';

        clearInterval(this.intervals?.[firstIntervalName ]);
        clearInterval(this.intervals?.[secondIntervalName]);

        this.tempData['refreshingConnection'] = true;
        this.intervals[firstIntervalName] = setInterval(() => {
            if (this.socketService.getSocket().Socket?.connected !== true) {
                this.tempData['refreshingConnection'] = 'error';
                this.intervals[secondIntervalName] = setInterval(() => {
                    this.tempData['refreshingConnection'] = undefined;
                    clearInterval(this.intervals[secondIntervalName]);
                }, 2000)
            }else{
                this.tempData['refreshingConnection'] = undefined;
            }
            clearInterval(this.intervals[firstIntervalName]);
        }, 5000);

    }

    public getRefreshingText(): string {
        if (this.wifiConnection == false) {
            return '<i class=\'fa-solid fa-xmark\'></i> Nepřipojeno k internetu';
        }
        if (this.tempData['refreshingConnection'] == true) {
            return '<i class=\'fa fa-circle-notch fa-spin\'></i> Aktualizuji..';
        }
        if (this.tempData['refreshingConnection'] == 'error') {
            return '<i class=\'fa-solid fa-xmark\'></i> Selhalo';
        }
        return 'Aktualizovat';
    }

    /**
     * @returns username output with placeholders its used in user dropdown in board
     */
    public getUsernamePlaceholders(): string {
        let user = this.userService.getUser()
        let output = '';
        if (!user) {
            return 'Načítání';
        }

        if (user.type == 'student') {
            output += "%class% ";
        }
        output += "%first-name% %last-name% ";

        return output;

    }

    /**
     * This function change %placeholder% to value of placeholder
     * @param text text including %placeholder%
     * @returns 
     */
    public formatPlaceholders(text: string): string {
        let user = this.userService?.getUser();
        if (!user) return text;
        let changedText = text
        .replaceAll('%first-name%', user?.firstName)
        .replaceAll('%last-name%', user?.lastName)
        .replaceAll('%username%', user?.username)
        .replaceAll('%locale%', user?.locale)
        .replaceAll('%sex%', user?.sex)
        .replaceAll('%class%', (user as UserMain)?.class)
        .replaceAll('%role%', user?.type)
        return changedText;
    }

    /**
     * Adds zeros in front of number based on length
     * @param number number where you want change length
     * @param len length of number
     * @returns number 128 to length 5 is set to 00128
     */
    public addZeros(number: number, len: number = 2): string {
        if (number.toString().length >= len) return number.toString();
        let num: string = '';
        for(let i = 0;i <= len;i++) {
            if (number.toString().length >= len - i) {
                return num + number.toString();
            }
            num += '0';
        }
        return number.toString();
    }


    //?-- Connection
    private wifiConnection: boolean = window.navigator.onLine;

    //?-- Permission system
    /**
     * Check if user has access to somewhere
     * @param required here you put required permissions needed to access this page/card/section
     * @returns 
     */
    public checkPermissions(required: UserPermissions[]): boolean {
        let user = this.userService.getUser();
        if (!user && (required.includes('onlynonlogged') || required.includes('nonlogged'))) return true;
        if (!user) return false;
        if (user && required.includes('onlynonlogged')) return false;
        return (required.includes('all') || (required.includes(user.type)));
    }

    //?-- Sidebar system
    public sidebarToggled: boolean = false;
    
    /**
     * Returns dashboard's sidebar in array
     * @returns visible sidebar to user
     */
    public getBoardSidebar(): SidebarGroup[] {
        let boardSidebar = this.sidebar.data as SidebarGroup[];
        let newSidebar: SidebarGroup[] = [];

        boardSidebar.forEach((section: SidebarGroup) => {
            if (section.permission && this.checkPermissions(section.permission as UserPermissions[]) == false) return;
            if (section.items.length == 0) return;
            let items: SidebarItem[] = [];
            section.items.forEach((item: SidebarItem) => {
                if (item.permission && this.checkPermissions(item.permission as UserPermissions[]) == false) return;
                items.push(item);
            })
            newSidebar.push({ label: section.label, items: items });
        })
        return newSidebar;
    }

    public boardSidebar = this.getBoardSidebar();


    //?-- Calendar
    private today: Date = new Date();
    private thisWeek: number = this.today.getWeek();

    /**
     * @returns Today's date
     */
    public getToday(): Date {
        return this.today;
    }

        /**
     * @returns Today's Week number
     */
    public getThisWeek(): number {
        return this.thisWeek;
    }


    //?-- Timetable
    private subjects: Subject[] = [];

}