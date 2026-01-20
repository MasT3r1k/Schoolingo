import { inject, Injectable } from "@angular/core";
import { SchoolConfig } from "./index.d";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Config } from "@Schoolingo/config";
import { BoardAlertManager } from "../alert/board.alert.manager";
import { Modules } from "@Schoolingo/modules";
import { Sidebar } from "@Schoolingo/sidebar";

@Injectable()
export class School {
    private http = inject(HttpClient);
    private alert = inject(BoardAlertManager);
    private modules = inject(Modules);
    private sidebar = inject(Sidebar);

    public config = new BehaviorSubject<SchoolConfig | null>(null);
    public school_loading_error = null;

    constructor() {
        this.http.get<SchoolConfig>(Config.API_URL + '/v1/school')
        .subscribe(
            (school: SchoolConfig) => {
                this.config.next(school);
                this.modules.setModules(parseInt(school.modules));
                this.sidebar.build();
            },
            (err) => {
                this.school_loading_error = err.status;
                switch(err.status) {
                    case 429:
                        this.alert.alert("error", "schools.errors.429", []);
                        break;
                }
            });
    }
}