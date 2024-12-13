/** Traineeship */
export type DiaryWeek = {
    start: moment.Moment;
    end: moment.Moment;
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