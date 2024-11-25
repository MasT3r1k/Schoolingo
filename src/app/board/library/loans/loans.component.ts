import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';

enum bookLoanStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = "completed",
  BORROWED = "borrowed",
  RETURNED = "returned",
  OVERDUE = "overdue"
}

interface BookLoan {
  name: string;
  publisher: string;
  language: string;
  status: bookLoanStatus;
}

@Component({
  standalone: true,
  imports: [],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.css', '../../../Styles/card.css']
})
export class LoansComponent {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public loans: BookLoan[] = [
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    {
      name: "Filipovo Tajemství",
      publisher: "NapicuVydavatelství",
      language: "Czech",
      status: bookLoanStatus.ACTIVE
    },
    
  ];
}
