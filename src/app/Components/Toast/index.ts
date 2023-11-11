import { Injectable } from "@angular/core";

export type Toast = {
    text: string;
}

@Injectable()
export class ToastService {

    private toasts: Toast[] = [];

    /**
     * Shows toast on bottom part of screen
     * @param text Text you want to display the toast
     * @param timer Time how long you want to display the toast
     */
    public showToast(text: string, timer: number = 5000) {
        this.toasts.push({ text });
        setTimeout(() => {
            let _toast = this.toasts.filter(_ => _.text == text)?.[0];
            this.toasts.splice(this.toasts.indexOf(_toast), 1);
        }, timer);
    }

    public getToasts(): Toast[] {
        return this.toasts;
    }

}