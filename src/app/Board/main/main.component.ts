import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', './module.css']
})
export class MainComponent implements OnInit {
  ngOnInit(): void {
    setTimeout(() => {
      document.querySelectorAll(".module-content").forEach(_ => {
        _.addEventListener("scroll", (e) => {
          let html = e.target as HTMLElement
          let header = html.parentElement?.querySelector("header");
          if (html.scrollTop > 0) {
            if (header?.classList.contains("bottom-shadow")) return;
            header?.classList.add("bottom-shadow");
          }else{
            if (!header?.classList.contains("bottom-shadow")) return;
            header?.classList.remove("bottom-shadow");
          }
        })
      })
    })
  }
}
