import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormInput, FormButton, FormError } from './FormManager.d';
import { Locale } from '@Schoolingo/Locale';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { removeDiacritics } from '@Schoolingo/SearchFilter';
export type { FormInput, FormButton, FormError };

@Component({
    selector: 'schoolingo-form',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, CommonModule],
    template: `<form [formGroup]="this.formData" (submit)="this.buttons[0].func ? this.buttons[0].func() : ''">
    <input type="submit" value="" style="display: none" />
    @for (input of this.inputs; track input.name) {
        <div class="form-group">
            @if(input.label) {
                <label [attr.for]="input.name" [ngClass]="{ error: this.getError(input.name) != null }">
                    {{ locale.getLocale(input.label) }}
                    <span
                        class="label-error"
                        *ngIf="this.getError(input.name) != null"
                    >
                        -
                        {{ locale.getLocale('' + this.getError(input.name)) }}</span
                ></label>
            }

            @switch(input.type) {
                @case('select') {
                    @if (input.select === 'search') {

                        <input [type]="input.type" [ngClass]="{ invalid: this.getError(input.name) != null}" [name]="input.name" [formControlName]="input.name" [placeholder]="input.placeholder ? locale.getLocale(input.placeholder) : ''">

                        <div class="search-dropdown" id="suggets">
                            @for(option of input.options;track $index) {
                                @if (removeDiacritics(option).toLowerCase().includes(removeDiacritics(this.formData.value[input.name]).toLowerCase())) {
                                    <div [ngClass]="{'input-select-option': true, active: (input.value !== undefined) ? option === getValue(input.value) : false}" (click)="input?.onSelect(option)">{{ input.optionAsLocale ? locale.getLocale(option) : option }}</div>
                                }
                            }
                        </div>

                    } @else {
                        <div [ngClass]="{'input-select': true, 'input-row': input.select === 'row', 'input-column': input.select === 'column'}">
                            @for(option of input.options;track $index) {
                                <div [ngClass]="{'input-select-option': true, active: (input.value !== undefined) ? option === getValue(input.value) : false}" (click)="input?.onSelect(option)">
                                    {{ input.optionAsLocale ? locale.getLocale(option) : option }}
                                </div>
                            }

                        </div>
                    }
                }

                @default {
                    <input [type]="input.type" [ngClass]="{ invalid: this.getError(input.name) != null}" [name]="input.name" [formControlName]="input.name" [placeholder]="input.placeholder ? locale.getLocale(input.placeholder) : ''" [required]="'' + input.required" [readOnly]="input.readonly">
                }
            }
            
            @for(note of input.notes; track note.note) {
                @if (note.url) {
                    <a [href]="note.url">{{ locale.getLocale(note.note) }}</a>
                }

                @else if (note.func) {
                    <a (click)="note.func()">{{ locale.getLocale(note.note) }}</a>
                }

                @else {
                    <a>{{ locale.getLocale(note.note) }}</a>
                }
            }
        </div>
    }

    @for (button of this.buttons;track button) {
        <div class="form-group">
            <div [ngClass]="{btn: true, submit: true, disabled: !canExecute()}" role="button" (click)="(button?.func) ? button?.func(this) : this.execute()" [innerHTML]="this.executing ? '<div class=btn-loader></div> ' + locale.getLocale(button.executed) : locale.getLocale(button.label)"></div>
        </div>
    }

</form>`,
    styleUrls: ['../../Styles/input.css']
})

export class FormManager implements OnInit {

    ngOnInit(): void {
        this.refreshFormGroup();
        this.forms.addForm(this);
    }

    constructor(public locale: Locale, private forms: FormList) {}

    public formData!: FormGroup;
    public errors: FormError[] = [];
    public executing: boolean = false;

    public executeFn: Function = () => {};
    private executingTimeout!: NodeJS.Timeout;

    removeDiacritics = removeDiacritics;

    @Input() form!: string;
    @Input() inputs: FormInput[] = [];
    @Input() buttons: FormButton[] = [];

    public getValue(value: Function | string | undefined): string {
        if (value === undefined) return '';
        return (typeof value === 'function') ? value() : value;
    }

    updateInputs(inputs: FormInput[]): void {
        this.inputs = inputs;
        this.refreshFormGroup();
    }

    updateButtons(buttons: FormButton[]): void {
        this.buttons = buttons;
        this.refreshFormGroup();
    }

    addError(input: string, error: string): void {
        let alreadyError = this.errors.filter((err: FormError) => err.input === input);
        if (alreadyError.length > 0) {
            alreadyError.forEach((err: FormError) => {
                this.errors.splice(this.errors.indexOf(err), 1);
            });
        }
        this.errors.push({ input, locale: error });
    }

    getError(input: string): string | null {
        let error = this.errors.filter((error: FormError) => error.input === input);
        return (error.length > 0) ? error[0].locale : null;
    }

    public canExecute(): boolean {
        let canExecuted: boolean = true;
        this.inputs.forEach((input: FormInput) => {
            if (input.type !== 'select' && input?.required === true && this.formData.value[input.name] === '' ) {
                canExecuted = true;
            }
        });

        return canExecuted;
    }

    public execute(): void {
        clearTimeout(this.executingTimeout);
        this.executing = true;
        this.errors = [];
        this.inputs.forEach((input: FormInput) => {
            if (input.type !== 'select' && input?.required === true && this.formData.value[input.name] === '') {
                this.addError(input.name, 'required');
            }
        });
        if (this.errors.length !== 0) {
            this.executing = false;
            return;
        }

        this.executingTimeout = setTimeout(() => {
            this.executing = false;
        }, 10000);

    }

    public refreshFormGroup(): void {
        let obj: any = {};
        if (!this || this.inputs.length == 0) return;
        this.inputs.forEach((input: FormInput) => {
          obj[input.name] = new FormControl(this.getValue(input.value) ?? '');
        });
        this.formData = new FormGroup(obj);
    }

    public removeMe(): void {
        this.forms.forms.splice(this.forms.forms.indexOf(this), 1);
    }

}


@Injectable({ providedIn: 'root' })
export class FormList {
    public forms: FormManager[] = [];

    addForm(form: FormManager): void {
        this.forms.push(form);
    }

    getForm(name: string): FormManager | undefined {
        return this.forms.filter((form: FormManager) => form.form === name)[0] ?? undefined;
    }


}