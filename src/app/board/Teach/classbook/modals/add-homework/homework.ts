import { Component, inject } from "@angular/core";
import { DropdownManager } from "@Schoolingo/dropdown";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { Classbook } from "@Schoolingo/classbook";
import { ModalManager } from "@Schoolingo/modal";
import { CalendarComponent } from "@Components/calendar";
import { CalendarManager } from "@Components/calendar-dropdown";
import moment from "moment";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    imports: [IconsModule, CalendarComponent, CommonModule, FormsModule],
    templateUrl: './homework.html',
    styleUrls: ['./homework.css', '../../../../../Components/modal/modal.css']
})

export class HomeworkModal {
    public l = inject(Locale);
    public dropdownManager = inject(DropdownManager);
    public calendarManager = inject(CalendarManager);
    public modalManager = inject(ModalManager);
    public classbook = inject(Classbook);
    public errors: any = {};
    public type: string = 'info';

    public assign_at = moment();
    public submit_at = moment().add(7, 'days');

    public assignmentText: string = '';
    
    // AI Assistant state
    public showAiAssistant: boolean = false;
    public aiChat: { role: 'user' | 'ai', content: string }[] = [];
    public aiPrompt: string = '';
    public isGeneratingAi: boolean = false;

    public toggleAiAssistant(): void {
        this.showAiAssistant = !this.showAiAssistant;
    }

    public async sendAiPrompt(): Promise<void> {
        if (!this.aiPrompt.trim() || this.isGeneratingAi) return;

        // Add user prompt to chat
        this.aiChat.push({ role: 'user', content: this.aiPrompt });
        const currentPrompt = this.aiPrompt;
        this.aiPrompt = '';
        this.isGeneratingAi = true;

        // TODO: Here the user will integrate their own backend.
        // Mocking the AI response for frontend demonstration:
        setTimeout(() => {
            let aiResponse = "Toto je ukázkový vygenerovaný text na základě promptu. (Implementujte backend pro skutečnou AI odpověď.)";
            this.aiChat.push({ role: 'ai', content: aiResponse });
            this.isGeneratingAi = false;
        }, 1500);
    }

    public applyAiText(text: string): void {
        this.assignmentText = text;
        this.showAiAssistant = false;
    }

    public resetAiChat(): void {
        this.aiChat = [];
        this.aiPrompt = '';
    }

    public openFiles(): void {
        this.modalManager.openModal('classbook_files', {
            files: this.classbook.files,
            origin: 'classbook',
            onAssign: (files: any) => {
                this.classbook.files = files;
            }
        });
    }

    // Calendar subscriptions are handled via (valueChange) in template
}