import { inject, Injectable } from "@angular/core";
import { SchoolConfig } from "./index.d";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Config } from "@Schoolingo/config";
import { AlertManager } from "@Schoolingo/alert";

@Injectable()
export class School {
    private http = inject(HttpClient);
    private alert = inject(AlertManager);

    public config = new BehaviorSubject<SchoolConfig | null>(null);
    constructor() {
        this.http.get<SchoolConfig>(Config.API_URL + '/v1/school')
        .subscribe( (school: SchoolConfig) => this.config.next(school),
                    (err) => {
                        switch(err.status) {
                            case 429:
                                this.alert.alert("error", "schools.errors.429", []);
                                break;
                        }
                    });
    }
}