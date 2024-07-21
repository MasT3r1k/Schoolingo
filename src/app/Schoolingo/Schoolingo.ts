import { Injectable } from "@angular/core";
import { Locale } from "./Locale";
import { SocketService } from "./Socket";
import { Theme } from "./Theme";
import { UserService } from "./User";
import { Sidebar } from "./Sidebar";

@Injectable()
export class Schoolingo {

    constructor(

        public locale: Locale,
        public socketService: SocketService,
        public theme: Theme,
        public userService: UserService,
        public sidebar: Sidebar

    ) {}

}