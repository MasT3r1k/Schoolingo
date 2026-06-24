import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Permission } from '@Schoolingo/permission';
import { MoneyPipe } from "../../../pipes/money/money.pipe";

@Component({
  selector: 'app-graduate-class-fund',
  standalone: true,
  imports: [CommonModule, IconsModule, MoneyPipe],
  templateUrl: './graduate-class-fund.component.html',
  styleUrls: ['./graduate-class-fund.component.css']
})
export class GraduateClassFundComponent implements OnInit {
  public perm = inject(Permission);

  public fund = {
    collected: 45200,
    target: 80000,
    students: [
      { id: 1, name: 'Jan Novák', amount_paid: 2000, target: 3000, status: 'behind' },
      { id: 2, name: 'Eva Malá', amount_paid: 3000, target: 3000, status: 'ok' }
    ]
  };

  ngOnInit(): void {
  }
}
