import { Component, OnInit } from '@angular/core';
import { IconsModule } from '../../../Modules/Icons.module';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './childrenSwitch.component.html',
  styleUrls: ['./childrenSwitch.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})
export class childrenSwitchComponent implements OnInit {
  Utils = Utils;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }
}
