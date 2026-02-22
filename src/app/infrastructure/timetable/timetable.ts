import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Authentication } from "@Schoolingo/authentication";
import { Config } from "@Schoolingo/config";
import { School } from "@Schoolingo/school";
import { Utils } from "@Schoolingo/utils";
import moment from "moment";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { absence, working_mode } from "@Schoolingo/absence";
import { TimetableAPI, TimetableHours } from "../../board/Teach/timetable/timetable.component";
@Injectable()
export class Timetable {
    private http = inject(HttpClient);
    private u = inject(Authentication);
    private school = inject(School);
    public Utils = Utils;
    public absenceConfig = absence;
    public workingModeConfig = working_mode;

    public timetable_types: Record<string, any> = {
        teaching: { name: 'Výuka', color: '#3498db' },
        substitution: { name: 'Suplování', color: 'hsla(353deg, 85%, 53%, .16)' },
        cancelled_hour: { name: 'Zrušená hodina', color: '#e74c3c' },
        trip: { name: 'Výlet', color: '#2ecc71' },
        holiday: { name: 'Prázdniny', color: '#61B0FF' },
        tutoring: { name: 'Doučování', color: '#8e44ad' },
        advice: { name: 'Porada', color: '#1abc9c' },
        school_event: { name: 'Školní akce', color: '#f39c12' },
        class_meeting: { name: 'Třídní schůzka', color: '#d35400' },
        class_lesson: { name: 'Třídní hodina', color: '#4A90E2' },
        exam: { name: 'Zkouška', color: '#c0392b' },
        supervision: { name: 'Dozor', color: '#e67e22' }
    };

    /**
     * Stáhne a zpracuje rozvrh z backendu pro daného uživatele/třídu/místnost.
     * Vrátí BehaviorSubjecty, kde data může komponenta odebírat.
     */
    public getTimetable(
        type: 'person' | 'class' | 'room' | 'supervision',
        id: number | null,
        week: moment.Moment | null,
        selectedTab: number = 0 // 0 = aktuální, 1 = stálý
    ): {
        timetable: BehaviorSubject<any[]>,
        timetableHours: BehaviorSubject<TimetableHours[]>,
        isLoading: BehaviorSubject<boolean>
    } {
        const timetableSubject = new BehaviorSubject<any[]>([]);
        const timetableHoursSubject = new BehaviorSubject<TimetableHours[]>([]);
        const isLoadingSubject = new BehaviorSubject<boolean>(true);

        const requestBody = {
            type,
            id: id ?? this.u.getId(),
            time: (week ?? moment()).format('YYYY-MM-DD')
        };

        this.http.post<TimetableAPI>(
            Config.API_URL + '/v1/timetable',
            requestBody,
            { withCredentials: true }
        ).subscribe({
            next: (data: TimetableAPI) => {
                let maxHours = 0;
                const timetableBuild: any[] = [];

                if (data.timetable.length === 0 && data.substitution.length === 0) {
                    timetableSubject.next([]);
                    timetableHoursSubject.next([]);
                    isLoadingSubject.next(false);
                    return;
                }

                Object.values(data.timetable).forEach((item: any) => {
                    item.color = "";
                    item.all_day = false;
                    if (item.hour + 1 > maxHours) {
                        maxHours = item.hour + 1;
                    }

                    if (!timetableBuild[item.day]) {
                        timetableBuild[item.day] = [];
                    }

                    if (!timetableBuild[item.day][item.hour - 1]) {
                        timetableBuild[item.day][item.hour - 1] = [];
                    }

                    const currentDay = moment(Utils.getDayOfWeek(week ?? moment(), item.day));

                    if (data.absences) {
                        data.absences.forEach((absence: any) => {
                            if (currentDay.format('YYYY-MM-DD') === moment(absence.date).format('YYYY-MM-DD') && item.hour === absence.hour + 1) {
                                item.absence = absence.type;
                            }
                        });
                    }

                    if (data.working_modes) {
                        data.working_modes.forEach((wm: any) => {
                            if (currentDay.isBetween(wm.start_date, wm.end_date, 'day', '[]') || currentDay.format('YYYY-MM-DD') === moment(wm.start_date).format('YYYY-MM-DD') || currentDay.format('YYYY-MM-DD') === moment(wm.end_date).format('YYYY-MM-DD')) {
                                const wmId = this.workingModeConfig.findIndex(c => c.locale === wm.type);
                                if (wmId !== -1) {
                                    item.working_mode = wmId;
                                }
                            }
                        });
                    }

                    let substitution = data.substitution.find((sub: any) => {
                        const isCorrectDay = currentDay.isBetween(sub.start_date, sub.end_date, 'day', '[]') || currentDay.format('YYYY-MM-DD') === moment(sub.start_date).format('YYYY-MM-DD') || currentDay.format('YYYY-MM-DD') === moment(sub.end_date).format('YYYY-MM-DD');
                        const isCorrectHour = item.hour >= sub.start_hour && item.hour <= sub.end_hour;
                        return isCorrectDay && isCorrectHour;
                    });

                    if (substitution && week != null) {
                        timetableBuild[item.day][item.hour - 1].push({
                            ...item,
                            type: substitution.type,
                            subjectName: substitution.subject_name || substitution.event_name,
                            subjectShortcut: substitution.subject_shortcut,
                            all_day: (substitution.start_hour === -1 || substitution.end_hour === -1),
                            color: this.timetable_types[substitution.type]?.color ?? "",
                            teacher: substitution.teacher_id,
                            lastName: substitution.last_name,
                            room: substitution.room,
                            oldTeacher: item.last_name,
                            oldSubject: item.subject_name || [],
                            className: substitution.class_name,
                            group: { id: substitution.group_id || 0, text: substitution.group_name || '', num: substitution.group_num || '' },
                            hour: item.hour - 1,
                            empty: false
                        });
                    } else if (item.type === 0 || selectedTab === 1 || selectedTab !== 1 && item.type > 0
                        && (this.Utils.isOdd(week?.isoWeek()!) && item.type === 1 ||
                            !this.Utils.isOdd(week?.isoWeek()!) && item.type === 2)
                    ) {
                        timetableBuild[item.day][item.hour - 1].push({
                            ...item,
                            hour: item.hour - 1,
                            subjectName: item.subjectName,
                            subjectShortcut: item.subjectShortcut,
                            empty: false
                        });
                    }
                });

                timetableSubject.next(timetableBuild);

                let schoolConfig = this.school.config.getValue();
                let hours: TimetableHours[] = [];
                let time = moment()
                    .set('hours', schoolConfig?.start_hour!)
                    .set('minutes', schoolConfig?.start_minute!);

                for (let i = 1; i <= Math.max(maxHours, 8); i++) {
                    let startHour = time.clone();
                    time.add(schoolConfig?.lesson_hour, 'minutes');
                    hours.push({
                        startMoment: startHour.clone(),
                        start: startHour.format('HH:mm'),
                        endMoment: time.clone(),
                        end: time.format('HH:mm')
                    });
                    let customBreak = schoolConfig?.breaks.filter((_) => _.hour === i + 1)[0]?.minutes;
                    time.add(customBreak || schoolConfig?.break_time, 'minutes');
                }

                timetableHoursSubject.next(hours);
                isLoadingSubject.next(false);
            },
            error: () => {
                timetableSubject.next([]);
                timetableHoursSubject.next([]);
                isLoadingSubject.next(false);
            }
        });

        return {
            timetable: timetableSubject,
            timetableHours: timetableHoursSubject,
            isLoading: isLoadingSubject
        };
    }
}