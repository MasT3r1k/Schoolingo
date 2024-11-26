import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Locale } from "@Schoolingo/Locale";
import { Data, DatalistOptions } from "@Components/Datalist/Datalist.d";
import { BehaviorSubject, Subscription } from "rxjs";
import { NgClass } from "@angular/common";
import { SocketService } from "@Schoolingo/Socket";
export { Data, DatalistOptions }
@Component({
    selector: 'schoolingo-datalist',
    templateUrl: './Datalist.html',
    standalone: true,
    imports: [NgClass],
    styleUrls: ['./Datalist.css', '../../Styles/input.css'],
    outputs: ['datalist']
})
export class DatalistComponent implements OnInit {
    
    private listeners: Subscription[] = [];

    constructor(
        public locale: Locale,
        public socketService: SocketService
    ) {}

    @Input() options: DatalistOptions = {};
    @Input() head: string[] = [];
    @Input() data: BehaviorSubject<any> = new BehaviorSubject([]);
    @Output() datalist = new EventEmitter<this>();

    public page: number = 1;
    public dataPerPage: number = 15;
    
    public isEditingPage: boolean = false;

    public editPage() {
        this.isEditingPage = true;
    }

    public savePage() {
        this.isEditingPage = false;
        let pageText = document.querySelector("#currentPage")?.textContent as string;
        let page = parseInt(pageText);
        if (pageText != page.toString() || page < 0 || page > this.getMaxPages())
        this.page = page;
        this.refreshData()
    }

    public visibleData: any[] = [];

    public getMaxPages(): number {
        return Math.ceil(this.data.getValue().length / this.dataPerPage);
    }

    public refreshData(): void {
        this.visibleData = this.data.getValue().slice((this.page - 1) * this.dataPerPage, this.page * this.dataPerPage);
    }

    public loadData(): void {
        if (this.options.url) {
            this.socketService.emit(this.options.url, { limit: this.dataPerPage, page: this.page, ignore: this.options.ignore ?? [] });
        }
    }

    public goPage(page: number): void {
        if (page <= 0 || page > this.getMaxPages()) return;
        this.loadData();

        this.page = page;
        this.refreshData();
    }

    ngOnInit(): void {
        this.datalist.emit(this);
        this.refreshData();
        this.loadData();

        this.listeners.push(this.data.subscribe((val: any[]) => {
            this.refreshData();
        }));
        if (this.options.url) {
            this.listeners.push(this.socketService.addFunction(this.options.url).subscribe(() => {
                this.refreshData();
            }));
        }
        
    }

    ngOnDestroy(): void {
        this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
    }
}