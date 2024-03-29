import { Component, OnInit, Renderer2 } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { Tabs } from '@Components/Tabs/Tabs';
import { Router } from '@angular/router';
import { UserService } from '@Schoolingo/User';
import { CalendarComponent, CalendarOptions } from '@Components/calendar/calendar.component';
import { Calendar } from '@Components/calendar/calendar';
import { TTableLesson } from '@Schoolingo/Board.d';
import { Modals } from '@Components/modals/modals';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from "pdfmake/build/vfs_fonts";

@Component({
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../board.css', '../../../Components/Dropdown/dropdown.css', '../../../Components/Tabs/tabs.component.css']
})
export class TimetableComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo,
    public userService: UserService,
    public locale: Locale,
    public dropdown: Dropdowns,
    public tabs: Tabs,
    private renderer: Renderer2,
    private router: Router,
    private calendarService: Calendar,
    private modals: Modals
  ) {

    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs; // PDF FONTS

    this.dropdown.addDropdown('absence');
    this.dropdown.addDropdown('lessonInformation');
  }

  // Default values
  public tabName: string = 'timeTable';
  public selectedLesson: TTableLesson | null = null;
  public calendarName = this.tabName;
  public calendarOptions: CalendarOptions = {
    allowWeekends: false,
    noWeekendError: 'errors/noClassOnWeekend',
  };
  public declare calendarEl: CalendarComponent;
  private declare renderBeforePrint: Function;
  private declare renderAfterPrint: Function;
  private declare routerSub;

  // Detailed information about lesson
  public detailedInformationPosition: { x: number;y: number; } = { x: 0, y: 0 };
  public showLesson(event: MouseEvent, lesson: TTableLesson): void {
    if (lesson.isEmpty == true) {
      this.selectedLesson = null;
      return;
    }
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    this.detailedInformationPosition = { x: mouseX, y: mouseY };
    if (lesson !== this.selectedLesson) {
      this.dropdown.closeAllDropdowns();    
    }
    this.dropdown.toggleDropdown('lessonInformation');
    this.selectedLesson = lesson;
  }

  // Timetable tabs
  private selectedTimeTableReasonPrint: number = 0;

  public beforePrint(): void {
    this.selectedTimeTableReasonPrint = this.tabs.getTabValue(this.tabName);
    this.tabs.setTabValue(this.tabName, 2);
  }

  public afterPrint(): void {
    this.tabs.setTabValue(this.tabName, this.selectedTimeTableReasonPrint);
    this.selectedTimeTableReasonPrint = 0;
  }


  ngOnInit(): void {


    // Setup page
    this.schoolingo.refreshTimetable();

    this.registerOnChangeFunc();
    this.routerSub = this.router.events.subscribe((url: any) => {
      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || (url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login')) { return; }

      setTimeout(() => {
        this.registerOnChangeFunc();

        if (this.schoolingo.isDayWeekend(this.schoolingo.getToday())) {
          this.schoolingo.selectWeek(this.schoolingo.getThisWeek() + 1);
          this.tabs.setTabValue(this.tabName, 1);
        }else{
          this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
          this.tabs.setTabValue(this.tabName, 0);
        }


        this.calendarEl = this.calendarService.getCalendar(this.calendarName);
        if (this.calendarEl) {
          this.calendarEl.customPickFunction = (date: Date) => {
            if (date == null) return this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
            this.tabs.setTabValue(this.tabName, 3);
            return this.schoolingo.selectWeek((date as Date).getWeek());
          }
        }
      })

    });

    this.renderBeforePrint = this.renderer.listen(window, 'beforeprint', () => this.beforePrint());
    this.renderAfterPrint = this.renderer.listen(window, 'afterprint', () => this.afterPrint());
  }

  public registerOnChangeFunc(): void {
    setTimeout(() => {
      if (this.router.url != '/teach/timetable') return;
      this.tabs.setOnChangeFunc(this.tabName, (id: number) => {
        switch(id) {
          case 0:
            this.schoolingo.selectWeek(this.schoolingo.getThisWeek() - 1);
            break;
          case 1:
            this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
            break;
          case 2:
            this.schoolingo.selectWeek(null);
            break;
          case 3:
            this.schoolingo.selectWeek(this.calendarEl?.date.getWeek() - 1);
            break;
        }

        this.schoolingo.refreshTimetable();
      })
    });

    pdfMake.createPdf(this.timeTablePDF).getDataUrl((url: string): void => {
      console.log(url);
    });
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.renderBeforePrint();
    this.renderAfterPrint();
  }

  public showPrintModal(): void {
    this.modals.openModal('print_timetable', { title: 'timetable/print', disableEscape: false, allowMultiModals: false,  });
  }


  public timeTablePDF: any = {
    info: {
      title: this.locale.getLocale('sidebar/teach/timetable'),
      author: "SCHOOLINGO System"
    },

    content: [
      {
        text: 'Your awesome name - and your class',
        style: 'header'
      }
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true
      }
    }
  };

}
