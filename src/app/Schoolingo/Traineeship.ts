import { Data } from "@Components/Datalist/Datalist";
import { Modal } from "@Components/Modal/Modal";
import { DiaryWeek, DiaryDay, TraineeshipData } from "@Schoolingo/Traineeship.d";
import moment from "moment";
import { BehaviorSubject } from "rxjs";
export { DiaryWeek, DiaryDay, TraineeshipData };

export class Traineeship {
    public activateModal!: Modal;

    public selectedCompany: any;
    public instructors: number[] = [];
    public selectedInstructor: number | null = null;

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
                { value: 'traineeship/day', localePrefix: (index + 1 + '. '), isLocale: true },
                { value: day.format('DD.MM.YYYY'), isLocale: false },
                { value: 'traineeship/status/' + (this.diaryDays[day.format('YYYY-MM-DD')] ? this.diaryDays[day.format('YYYY-MM-DD')].status : 'unlisted'), isLocale: true },
                { value: (this.diaryDays[day.format('YYYY-MM-DD')] ? this.diaryDays[day.format('YYYY-MM-DD')].mark : 'traineeship/noMark'), isLocale: this.diaryDays[day.format('YYYY-MM-DD')] ? false : true }
            ]);
        });
        diary.push([
            { value: 'traineeship/finalWrite', isLocale: true },
            { value: "---", isLocale: false },
            { value: 'traineeship/status/' + (this.diaryDays['0000-00-00'] ? this.diaryDays['0000-00-00'].status : 'unlisted'), isLocale: true },
            { value: (this.diaryDays['0000-00-00'] ? this.diaryDays['0000-00-00'].mark : 'traineeship/noMark'), isLocale: this.diaryDays['0000-00-00'] ? false : true }
        ]);
        this.diary.next(diary);
    }

    public getDiaryByCompanyId(companyId: number): DiaryWeek[] {
        return this.diaryWeeks.getValue().filter((week: DiaryWeek) => week.company === companyId)
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


    public selectInstructor(instructor: number | null): void {
        this.selectedInstructor = instructor;
    }

    public selectDairy(dairy: DiaryWeek | null): void {
        this.selectedDairy = dairy;
        this.refreshDiary();
    }

    public getRating(company: any): string {
        return company.rating != null ? Number(company.rating).toFixed(1) : 'traineeship/noRating';
    } 


}