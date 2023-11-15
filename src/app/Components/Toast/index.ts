import { Locale } from "@Schoolingo/Locale";
import { Injectable } from "@angular/core";
import Swal, { SweetAlertIcon } from 'sweetalert2';

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

    constructor(
        public locale: Locale
    ) {}

    /**
     * Shows toast on bottom part of screen
     * @param text Text you want to display the toast
     * @param type Type of icon to show 
     * @param timer Time how long you want to display the toast, minimal 300ms :)
     */
    public showToast(text: string, type: SweetAlertIcon = 'success', timer: number = 5000) {
        Swal.fire({
            position: 'bottom',
            showConfirmButton: false,
            html: '<b>' + this.locale.getLocale('toasts/' + type) + '</b> ' + text,
            icon: type,
            timer,
            customClass: {
                timerProgressBar: 'toast-progress-bar',
                closeButton: 'toast-close',
                container: 'toast-container'
            },
            timerProgressBar: true,
            showCloseButton: true,
            toast: true,
            padding: '12px 24px',
          });
    }
}