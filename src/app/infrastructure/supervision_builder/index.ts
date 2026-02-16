import { BehaviorSubject } from "rxjs";

export class SupervisionBuilder {
    public isScheduleLoading: boolean = true;
    public isTeachersLoading: boolean = true;
    public hours: any[] = [
        { start: '8:00', end: '8:45' },
        { start: '8:50', end: '9:35' },
        { start: '9:45', end: '10:30' },
        { start: '10:50', end: '11:35' },
        { start: '11:40', end: '12:25' },
        { start: '12:30', end: '13:15' },
        { start: '13:20', end: '14:05' },
        { start: '14:10', end: '14:55' },
        { start: '15:00', end: '15:45' },
    ];

    public teachers: any[] = [];
    public places: any[] = [];
    public selectedPlace = new BehaviorSubject<number>(0);

    public getPlaceName(placeId: number): string {
        return this.places.find((item: any) => item.placeId == placeId)?.name ?? '';
    }
    
    // Schedule structure: Day -> Hour -> Supervisions
    public schedule: any[][][] = []; 
    public activeSupervision: any = null;

    public getScheduleUsedHours(): number {
        let used = 0;
        this.schedule.forEach((day) => {
            day.forEach((hour) => {
                if (hour.length) {
                    used += 1;
                }
            })
        })
        return used;
    }

    public getScheduleTotalHours(): number {
        return this.schedule.length * this.hours.length;
    }

    constructor() {
        // Initialize empty schedule (5 days, 9 hours)
        for (let i = 0; i < 5; i++) {
            this.schedule[i] = [];
            for (let j = 0; j < this.hours.length; j++) {
                this.schedule[i][j] = [];
            }
        }
    }
}
