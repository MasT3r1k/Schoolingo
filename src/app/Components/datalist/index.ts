import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { Locale } from "@Schoolingo/locale";
import { BehaviorSubject, debounceTime, Subscription } from "rxjs";
import { NgClass } from "@angular/common";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IconsModule } from "../../infrastructure/icons";
import { HttpClient } from "@angular/common/http";

export type Data = {
    value: string;
} & ({
    isLocale: true;
    localePrefix?: string;
    localeSuffix?: string;
} | {
    isLocale: false;
}) | {
    id: number;
} | {
    html: string;
};

export interface DatalistOptions {
    url?: string;
    search?: boolean;
    ignore?: string[];
    titles?: string[];
    hideInfo?: boolean;
    hideColumns?: number[];
    hidePagination?: boolean;
    disableLocales?: boolean[];
    noDynamic?: boolean;
}

export interface errorAPI {
    error: string;
    errorCode: string;
} 

export type dataAPI = ({
    rows: number;
    data: any[];
} | errorAPI);

export interface DatalistMetadata {
    rows: number;
    limit: number;
}

@Component({
    selector: 'schoolingo-datalist',
    templateUrl: './Datalist.html',
    standalone: true,
    imports: [NgClass, FormsModule, ReactiveFormsModule, IconsModule],
    styleUrls: ['./Datalist.css'],
    outputs: ['datalist']
})
export class DatalistComponent implements OnInit {
    
    private listeners: Subscription[] = [];
    public l = inject(Locale);
    private http = inject(HttpClient);

    constructor() { this.refreshData() }

    @Input() options: DatalistOptions = {};
    @Input() head: string[] = [];
    @Input() metadata: DatalistMetadata = { rows: 0, limit: 10 };
    @Input() selectedRow = -1;
    @Input() data = new BehaviorSubject<any>([]);
    @Input() search = new FormControl<string>("");
    @Input() clickFc!: Function;
    @Output() datalist = new EventEmitter<this>();

    public page = new BehaviorSubject(1);
    
    public isEditingPage = false;

    public editPage() {
        this.isEditingPage = true;
    }

    public savePage() {
        this.isEditingPage = false;
        let pageText = document.querySelector("#currentPage")?.textContent as string;
        let page = parseInt(pageText);
        if (pageText != page.toString() || page < 0 || page > this.getMaxPages())
        this.page.next(page);
        this.refreshData()
    }

    public visibleData: any[] = [];

    public getPageList(): number[] {
        let pages = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
        let list: number[] = [];
        pages.forEach((page: number) => {
            list.push(page + this.page.getValue());
        })

        let startSlice = 0;
        if (this.page.getValue() == 4 || this.page.getValue() == this.getMaxPages() - 1) {
            startSlice = 1;
        }
        
        else if (this.page.getValue() > 3 && this.page.getValue() <= this.getMaxPages() - 2) {
            startSlice = 2;
        }

        return list.filter((page) => page > 0 && page <= this.getMaxPages()).slice(startSlice).slice(0,5);
    }

    public getMaxPages(): number {
        return Math.ceil(this.metadata.rows / this.metadata.limit);
    }

    public refreshData(): void {
        this.visibleData = this.data.getValue().slice(0, this.page.getValue() * this.metadata.limit);
    }

    public getData(): any[] {
        return this.options.noDynamic ? this.data.getValue() : this.visibleData;
    }

    public goPage(page: number): void {
        if (page <= 0 || page > this.getMaxPages()) return;
        this.page.next(page);
        this.refreshData();
    }

    public clickEvent(index: number): void {
        if (!this.clickFc) return;
        let ids = this.data.getValue()[index].filter((_: any) => _.id);
        this.clickFc(ids, index);
    }

    public getColumnId(index: number): number {
        let columnId = index;
        if (this.data.getValue()) {
            this.data.getValue()[0].forEach((_: any, id: number) => {
                if (id > index) return;
                if (_.id) columnId--;
            });
        }
        return columnId;
    }

    ngOnInit(): void {
        this.datalist.emit(this);
        this.refreshData();
        this.listeners.push(
            this.data.subscribe(() => {
                this.refreshData();
            })
        );


        this.listeners.push(
            this.search.valueChanges.pipe(
                debounceTime(300))
                .subscribe(() => this.refreshData())
        );
        
    }

    public formatHtmlText(text: string): string {
        let html = "";
        if (text == "arrow") { }
        text.split(' ').forEach((word: string) => {
            if (word.startsWith("[l:") && word.endsWith(']')) {
                let key = word.slice(3, -1);
                html += this.l.s(key);
            } else {
                html += word + " ";
            }
        })
        return html;
    }

    ngOnDestroy(): void {
        this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
    }
}