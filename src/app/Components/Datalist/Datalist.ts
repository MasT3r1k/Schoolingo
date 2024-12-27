import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Locale } from "@Schoolingo/Locale";
import { Data, DatalistOptions, Metadata, dataAPI, errorAPI } from "@Components/Datalist/Datalist.d";
import { BehaviorSubject, debounceTime, Subscription } from "rxjs";
import { NgClass } from "@angular/common";
import { SocketService } from "@Schoolingo/Socket";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
export { Data, DatalistOptions, Metadata, dataAPI, errorAPI }
@Component({
    selector: 'schoolingo-datalist',
    templateUrl: './Datalist.html',
    standalone: true,
    imports: [NgClass, FormsModule, ReactiveFormsModule],
    styleUrls: ['./Datalist.css', '../../Styles/input.css'],
    outputs: ['datalist']
})
export class DatalistComponent implements OnInit {
    
    private listeners: Subscription[] = [];

    constructor(
        public locale: Locale,
        public socketService: SocketService
    ) { this.refreshData() }

    @Input() options: DatalistOptions = {};
    @Input() head: string[] = [];
    @Input() metadata: Metadata = { rows: 0 };
    @Input() selectedRow = -1;
    @Input() data: BehaviorSubject<any> = new BehaviorSubject([]);
    @Input() search: FormControl<string> = new FormControl();
    @Input() clickFc!: Function;
    @Output() datalist = new EventEmitter<this>();

    public page = 1;
    public dataPerPage = 15;
    
    public isEditingPage = false;

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
        if (!this.options.url) return;
        this.socketService.emit(this.options.url, { limit: this.dataPerPage, page: this.page, ignore: this.options.ignore ?? [], search: this.search.value ?? "" });   
    }

    public getData(): any[] {
        return this.options.noDynamic ? this.data.getValue() : this.visibleData;
    }

    public goPage(page: number): void {
        if (page <= 0 || page > this.getMaxPages()) return;
        this.loadData();

        this.page = page;
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
        this.loadData();

        this.listeners.push(this.socketService.addFunction("connect").subscribe(() => this.loadData()));

        this.listeners.push(this.data.subscribe(() => {
            this.refreshData();
        }));
        if (this.options.url) {
            this.listeners.push(this.socketService.addFunction(this.options.url).subscribe(() => this.refreshData()));
        }

        this.listeners.push(this.search.valueChanges.pipe(debounceTime(300)).subscribe(() => this.loadData()));
        
    }

    ngOnDestroy(): void {
        this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
    }
}