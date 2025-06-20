import { inject, Injectable } from "@angular/core";
import { Authentication } from "@Schoolingo/authentication";

@Injectable()
export class Homeworks {
    private auth = inject(Authentication)
    public list = [];
}