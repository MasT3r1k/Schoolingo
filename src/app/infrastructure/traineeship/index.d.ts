/** Traineeship */
export type DiaryWeek = {
    activity: string;
    traineeship: number;
    start: moment.Moment;
    start_working_hours: string;
    end: moment.Moment;
    end_working_hours: string;
    ignoredDays: string[];
    companyId: number;
    companyName: string;
    instructorId: number | null;
    instructor: string | null;
    web: string;
    rating: number | null;
    cityName: string;
    status: string;
    state: string;
    name: string;

    zapsaniStudenti?: number;
    celkemStudentu?: number;

}

export type DiaryDay = {
    date: moment.Moment;
    status: 'unlisted' | 'filed';
    title: string;
    hours: number;
    gained: string;
    description: string;
    mark: string;
}

export type TraineeshipData = {
    data: string;
    count: number;
}