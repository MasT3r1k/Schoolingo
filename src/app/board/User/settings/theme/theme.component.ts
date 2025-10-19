import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Theme } from '@Schoolingo/theme';

@Component({
  selector: 'settings-change-theme',
  standalone: true,
  imports: [NgClass, NgStyle, IconsModule],
  templateUrl: './theme.component.html',
  styleUrls: ['../settings.component.css', './theme.component.css']
})
export class ThemeComponent implements OnInit {
  public l = inject(Locale);
  public t = inject(Theme);

  ngOnInit(): void {
  }

}
