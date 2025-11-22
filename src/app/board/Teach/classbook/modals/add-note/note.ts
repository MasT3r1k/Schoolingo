import { HttpClient } from "@angular/common/http";
import { Component, inject, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Classbook } from "@Schoolingo/classbook";
import { Config } from "@Schoolingo/config";
import { Locale } from "@Schoolingo/locale";
import { ModalManager } from "@Schoolingo/modal";

@Component({
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './note.html',
    styleUrl: './note.css'
})

export class NoteModal implements OnInit {
    public l = inject(Locale);
    private http = inject(HttpClient);
    private modalManager = inject(ModalManager);
    private classbook = inject(Classbook);
    public errors: any = {};

    // === Inputs ===
    public title = '';
    public note = '';

    ngOnInit(): void {
        
    }

    public newNote(): void {
        this.errors = {};
        if (this.note == '') {
            this.errors.note = 'form.required';
            return;
        }
        this.http.post(
            `${Config.API_URL}/v1/classbook/add_note`,
            { subject_id: this.classbook.classbook.subjectId, group_id: this.classbook.classbook.groupId, title: this.title, note: this.note },
            { withCredentials: true }
        )
        .subscribe((data: any) => {
            if ('success' in data && data.success == true) {
                console.log(data)
                this.classbook.notes.unshift(data.note)
                this.modalManager.closeModal('add_note');
            }
        })
    }
}