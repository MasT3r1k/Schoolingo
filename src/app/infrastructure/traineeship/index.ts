import { Data } from "@Components/datalist";
import { DiaryWeek, DiaryDay, TraineeshipData } from "./index.d";
import moment from "moment";
import { BehaviorSubject } from "rxjs";
export type { DiaryWeek, DiaryDay, TraineeshipData };

export class Traineeship {
    public selectedCompany: any;
    public instructors: number[] = [];
    public selectedInstructor: number | null = null;

    public scopes: any[] = [];
    
    public ignoredDays: number[] = [6, 7];

    public diaryWeeks = new BehaviorSubject<DiaryWeek[]>([]);
    public selectedDairy: DiaryWeek | null = null;

    public boxData: TraineeshipData[] = [];

    public diaryDays: Record<string, DiaryDay> = {};
    public selectedDay: moment.Moment | null = null;
    public selectDay(day: moment.Moment | null): void {
        this.selectedDay = day;
    }

    public diary = new BehaviorSubject<Data[][]>([]);
    public refreshDiary(): void {
        this.diary.next([]);
        let week = this.selectedDairy;
        if (!week) return;
        let days: moment.Moment[] = [];
        let date = week.start.clone();
        while (date.isSameOrBefore(week.end)) {
            if (!this.ignoredDays.includes(date.isoWeekday())) {
            days.push(date.clone());
            }
            date.add(1, 'day');
        }

        let diary: Data[][] = [];
        days.forEach((day: moment.Moment, index: number) => {
            diary.push([
                { value: 'traineeship.day', localePrefix: (index + 1 + '. '), isLocale: true },
                { value: day.format('DD.MM.YYYY'), isLocale: false },
                { value: 'traineeship.status.' + (this.diaryDays[day.format('YYYY-MM-DD')] ? this.diaryDays[day.format('YYYY-MM-DD')].status : 'unlisted'), isLocale: true },
                { value: (this.diaryDays[day.format('YYYY-MM-DD')] ? this.diaryDays[day.format('YYYY-MM-DD')].mark : 'traineeship.no_mark'), isLocale: this.diaryDays[day.format('YYYY-MM-DD')] ? false : true }
            ]);
        });
        diary.push([
            { value: 'traineeship.finalWrite', isLocale: true },
            { value: "---", isLocale: false },
            { value: 'traineeship.status.' + (this.diaryDays['0000-00-00'] ? this.diaryDays['0000-00-00'].status : 'unlisted'), isLocale: true },
            { value: (this.diaryDays['0000-00-00'] ? this.diaryDays['0000-00-00'].mark : 'traineeship.no_mark'), isLocale: this.diaryDays['0000-00-00'] ? false : true }
        ]);
        this.diary.next(diary);
    }

    public getDiaryByCompanyId(companyId: number): DiaryWeek[] {
        return this.getFutureWeeks()
        .filter(
            (week: DiaryWeek) => companyId != undefined && week.companyId === companyId)
    }

    public checkIfValidDairy(week: DiaryWeek): any {
        console.log(week.instructorId, this.selectedCompany.instructors.some((instructor: any) => instructor.instructorId == week.instructorId))
        if (week.instructorId != null && this.selectedCompany && this.selectedCompany.instructors.some((instructor: any) => instructor.instructorId == week.instructorId && instructor.status == 'active') == false) {
            return 'invalid_instructor';
        }
        return true;
    }

    public getDays(week: DiaryWeek): number {
        let days: number = 0;
        let date = week.start.clone();
        while (date.isSameOrBefore(week.end)) {
          if (!this.ignoredDays.includes(date.isoWeekday())) {
            days++
          }
          date.add(1, 'day');
        }
        return days;
    }

    public getFutureWeeks(): DiaryWeek[] {
        return this.diaryWeeks.getValue().filter((week) => week.start.isAfter(moment()));
    }

    public isWeekOngoing(week: DiaryWeek): boolean {
        return moment().isBetween(week.start, week.end);
    }

    public getStateOfTraineeship(traineeship: DiaryWeek): 'planned' | 'ongoing' | 'finished' | 'canceled' {
        if (traineeship.state === 'canceled') return 'canceled';

        const now = moment();

        if (now.isBefore(traineeship.start)) return 'planned';
        if (now.isAfter(traineeship.end)) return 'finished';
        return 'ongoing';
    }

    public selectInstructor(instructorId: number | null): void {
        this.selectedInstructor = instructorId;
    }

    public getInstructorName(instructorId: number): string {
        return this.selectedCompany.instructors.find((instructor: any) => instructor.instructorId == instructorId).name;
    }

    public selectDairy(dairy: DiaryWeek | null): void {
        this.selectedDairy = dairy;
        if (!dairy) return;
        this.refreshDiary();
    }

    public selectDairyInstructor(instructorId: number, instructorName: string): void {
        let week = this.diaryWeeks.getValue().find((week) => week.traineeship == this.selectedDairy?.traineeship);
        if (!week) return;
        week.instructorId = instructorId;
        week.instructor = instructorName;
    }

    public getRating(company: any): string {
        return company.rating != null ? Number(company.rating).toFixed(1) : 'traineeship.no_rating';
    } 


}