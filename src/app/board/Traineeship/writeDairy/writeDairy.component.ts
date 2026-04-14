import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'schoolingo-traineeship-writeDairy',
  standalone: true,
  imports: [RouterLink, FormsModule, IconsModule],
  templateUrl: './writeDairy.component.html',
  styleUrls: ['../manage/manage.component.css']
})
export class writeDairyComponent {
  Utils = Utils;
  public traineeship = inject(Traineeship);
  public l = inject(Locale);
  private http = inject(HttpClient);

  public diaryData = {
    title: '',
    hours: 8,
    description: '',
    gained: ''
  };

  public saveDiary(): void {
    if (!this.traineeship.selectedDairy || !this.traineeship.selectedDay) return;

    this.http.post(
      Config.API_URL + '/v1/traineeship/save_diary',
      {
        traineeshipId: this.traineeship.selectedDairy.traineeship,
        date: this.traineeship.selectedDay.format('YYYY-MM-DD'),
        title: this.diaryData.title,
        hours: this.diaryData.hours,
        description: this.diaryData.description,
        gained: this.diaryData.gained
      },
      { withCredentials: true }
    ).subscribe((res: any) => {
      if (res && res.status === 'success') {
        const dateStr = this.traineeship.selectedDay!.format('YYYY-MM-DD');
        if (!this.traineeship.diaryDays[dateStr]) {
            this.traineeship.diaryDays[dateStr] = {} as any;
        }
        this.traineeship.diaryDays[dateStr].status = 'filed';
        this.traineeship.refreshDiary();
        this.traineeship.selectDay(null); // Close modal
      }
    });
  }
}
