import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';

@Component({
  imports: [],
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.css', '../messages.css']
})
export class SentComponent {
    Utils = Utils;
  
    public l = inject(Locale);
    public auth = inject(Authentication);
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
  
    public messages: any[] = [];
    public selectedMessage: any | null = null;
    public searchText = '';
}
