import moment from "moment";
import { BehaviorSubject } from "rxjs";
import { personDetails } from "./User";

export class Classbook {
    public students: personDetails[] = [];

    public selectedDate = new BehaviorSubject<moment.Moment>(moment());
    public selectedHour = new BehaviorSubject<number | null>(null);
    public selectedTab = new BehaviorSubject(0);
    public selectedAbsence = new BehaviorSubject<number>(0);
    public selectedStudent = new BehaviorSubject<personDetails | null>(null);

    // Settings for the absence
    public absenceMinutes = 0;
    public absenceReason = '';
    public absenceNote = '';
}