import { Component, inject, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";
import { ModalManager } from "@Schoolingo/modal";
import { Settings } from "@Schoolingo/settings";
import { Utils } from "@Schoolingo/utils";

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './generate-password.html',
  styleUrls: ['../../change-password.component.css']
})
export class GeneratePasswordComponent implements OnInit {
    public l = inject(Locale);
    private settings = inject(Settings);
    private modalManager = inject(ModalManager);

    public passwordStrength: number = 0;
    public passwordRequirements = {
        length: false,
        uppercase: false,
        number: false,
        special: false
    };

    public calculateStrength(password: string): void {
        let score = 0;
        if (!password) {
        this.passwordStrength = 0;
        this.passwordRequirements = { length: false, uppercase: false, number: false, special: false };
        return;
        }

        this.passwordRequirements.length = password.length > 8;
        this.passwordRequirements.uppercase = /[A-Z]/.test(password);
        this.passwordRequirements.number = /[0-9]/.test(password);
        this.passwordRequirements.special = /[^A-Za-z0-9]/.test(password);

        if (this.passwordRequirements.length) score++;
        if (this.passwordRequirements.uppercase) score++;
        if (this.passwordRequirements.number) score++;
        if (this.passwordRequirements.special) score++;

        this.passwordStrength = score;
    }

    // === ACTIONS ===
    /// Generate safe password
    public password = '';
    public generatePassword(): void {
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const special = "!@#$%^&*()_+";

        const all = lowercase + uppercase + numbers + special;

        // Povinné znaky
        let password = "";
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += special.charAt(Math.floor(Math.random() * special.length));

        // Doplnění do délky 16
        for (let i = password.length; i < 16; i++) {
            password += all.charAt(Math.floor(Math.random() * all.length));
        }

        // Zamíchání pořadí znaků
        password = password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

        this.password = password;
        this.calculateStrength(password);
    }

    /// Copy password to clipboard
    public copyPassword(): void {
        if (this.password == '') return;
        Utils.copyTextToClipboard(this.password);
    }

    /// Fill generated password to password inputs
    public fillInInput(): void {
        if (this.password == '') return;
        this.settings.password.next(this.password);
        this.modalManager.closeModal('generate_password');
    }

    ngOnInit(): void {
        
    }
}