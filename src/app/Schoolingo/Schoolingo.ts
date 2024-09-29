import { Injectable } from "@angular/core";
import { languages, Locale } from "./Locale";
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

    ) {

        this.locale.language.subscribe((value: languages) => {
            this.refreshTitle();
        });

    }

    public modal: string = '';

    public getUserRole(): string {
        let user = this.userService.getUser();
        if (user == null) {
            return "";
        }
        switch(user.type) {
            case "student":
                return this.locale.getLocale('roles/' + user.type) + ' - ' + user.class;
            default:
                return this.locale.getLocale('roles/' + user.type);
        }
    }

    public refreshTitle(): void {
        this.sidebar.updateTitle(window.location.pathname);
    }

}