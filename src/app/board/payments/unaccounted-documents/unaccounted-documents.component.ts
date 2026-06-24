import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-payment-unaccounted-documents',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './unaccounted-documents.component.html',
  styleUrls: ['./unaccounted-documents.component.css']
})
export class UnaccountedDocumentsComponent implements OnInit {
  public unaccountedDocs = [
    { id: 1, number: 'FV-2024-003', amount: 1200, date: '10. 11. 2024', description: 'Platba za obědy' },
    { id: 2, number: 'FV-2024-004', amount: 450, date: '11. 11. 2024', description: 'Neznámá platba' }
  ];

  ngOnInit(): void {
  }
}
