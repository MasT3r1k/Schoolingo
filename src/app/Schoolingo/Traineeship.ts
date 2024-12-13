import { Data } from "@Components/Datalist/Datalist";
import { DiaryWeek, DiaryDay } from "@Schoolingo/Traineeship.d";
import { BehaviorSubject } from "rxjs";
export { DiaryWeek, DiaryDay };

export class Traineeship {
    public declare selectedCompany: any;
    public instructors: number[] = [];
    public selectedInstructor: number | null = null;

    public ignoredDays: number[] = [6, 7];

    public diaryWeeks: DiaryWeek[] = [];
    public selectedDairy: DiaryWeek | null = null;
    public diaryDays: Record<string, DiaryDay> = {};

    public diary: BehaviorSubject<Data[][]> = new BehaviorSubject<Data[][]>([]);
    public refreshDiary(): void {
        this.diary.next([]);
        this.diaryWeeks.forEach((week: DiaryWeek) => {
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
            diary.push([{ value: 'traineeship/finalWrite', isLocale: true },
            { value: "---", isLocale: false },
            { value: 'traineeship/status/' + (this.diaryDays['0000-00-00'] ? this.diaryDays['0000-00-00'].status : 'unlisted'), isLocale: true },
            { value: (this.diaryDays['0000-00-00'] ? this.diaryDays['0000-00-00'].mark : 'traineeship/noMark'), isLocale: this.diaryDays['0000-00-00'] ? false : true }])
            this.diary.next(diary);
        })
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

    public selectDairy(dairy: DiaryWeek): void {
        this.selectedDairy = dairy;
    }

    public getRating(company: any): string {
        return company.rating != null ? Number(company.rating).toFixed(1) : 'traineeship/noRating';
    } 


}