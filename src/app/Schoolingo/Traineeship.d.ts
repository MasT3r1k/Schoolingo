/** Traineeship */
export type DiaryWeek = {
    traineeship: number;
    start: moment.Moment;
    end: moment.Moment;
    ignoredDays: string[];
    company: number;
    companyName: string;
    instructor: number | null;
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