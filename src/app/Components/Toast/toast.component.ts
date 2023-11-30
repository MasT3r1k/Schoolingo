import { Component, OnInit } from '@angular/core';
import { ToastService } from '@Components/Toast';
import { Locale } from '@Schoolingo/Locale';

@Component({
  selector: 'schoolingo-toasts',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  constructor(
    public toasts: ToastService,
    public locale: Locale
  ) {}

  ngAfterViewInit(): void {

    setInterval(() => {
      document.querySelectorAll(".toast").forEach(toast => {
        let toas = this.toasts.getToasts().filter(_ => _.name == toast.id)?.[0];
        if (!toas) return;
        (toast.querySelector(".progress") as HTMLElement).style.width = this.toasts.calcPercentage(toas.timer, toas.timeEnd) + "%";
      })
    }, 50)
  }

}
