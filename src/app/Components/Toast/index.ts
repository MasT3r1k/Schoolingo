import { Injectable } from "@angular/core";

export type ToastTypes = 'success' | 'info' | 'error';

export type Toast = {
    text: string;
    active: boolean;
    timer: number;
    name: string;
    timeEnd: number;
    type: ToastTypes;
}

@Injectable()
export class ToastService {

    private toasts: Toast[] = [];
    private intervals: Record<string, any> = {};

    private toast_animation: number = 300;  // In ms

    /**
     * Shows toast on bottom part of screen
     * @param text Text you want to display the toast
     * @param timer Time how long you want to display the toast, minimal 300ms :)
     */
    public showToast(text: string, type: ToastTypes = 'success', timer: number = 5000) {
        if (timer < this.toast_animation) { return console.error('Toast timer is too low. Please use more than ' + this.toast_animation + 'ms'); }
        let name = text + new Date().getTime() + Object.keys(this.intervals).length;
        let end = new Date().getTime() + timer;
        this.toasts.push({
            text,
            active: false,
            timer: timer,
            name: name,
            timeEnd: end,
            type,
        });

        let _toast = this.toasts.filter(_ => _.text == text)?.[0];

        setTimeout(() => {
            _toast.active = true;
        }) 
        setTimeout(() => {
            _toast.active = false;
            setTimeout(() => {
                this.close(name);
            }, this.toast_animation)
        }, timer - this.toast_animation);
    }

    /**
     * Close toast
     * @param name name of toast
     */
    public close(name: string): void {
        let _toast = this.toasts.filter(_ => _.name == name)?.[0];
        if (!_toast) return;
        _toast.active = false;
        setTimeout(() => {
            this.toasts.splice(this.toasts.indexOf(_toast), 1);
        }, this.toast_animation)
    }

    /**
     * @returns list of toasts
     */
    public getToasts(): Toast[] {
        return this.toasts;
    }

    /**
     * Calculate percentage of remain time toast - used for width
     * @param timer The full time
     * @param time_end The time of hiding
     * @returns remain time in %
     */
    public calcPercentage(timer: number, time_end: number): string | number {
        let percentage: number | string;
        let rozdil = time_end - new Date().getTime();
        percentage = Math.floor(rozdil / (timer / 100));
        return percentage;
    }

}