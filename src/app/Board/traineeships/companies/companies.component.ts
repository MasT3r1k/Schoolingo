import { Component, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';

@Component({
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css', '../../board.css', '../../../input.css']
})
export class CompaniesComponent implements OnInit {
  constructor(
    public locale: Locale,
    private socketService: SocketService
  ) {}

  private companies: any = [];

  async ngOnInit(): Promise<void> {
    try { 
      this.companies = await this.socketService.getSocket().Socket?.emit("traineeships/companies");
    } catch(e) {
      this.companies = [];
    }
  }
}
