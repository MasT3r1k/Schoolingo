interface Dropdown {
    name: string;
    active: boolean;
}

export class Dropdowns {

    private dropdowns: Dropdown[] = [];

    public addDropdown(name: string): void {
        this.dropdowns.push({ name: name, active: false });
    }

    public toggleDropdown(name: string, visible?: boolean): void {
        let dropdown = this.dropdowns.filter((dropdown: Dropdown) => dropdown.name == name)?.[0]
        let status = dropdown.active;
        setTimeout(() => {
            dropdown.active = (visible) ? visible : !status;
        })
    }

    public closeAllDropdowns(): void {
        this.dropdowns.forEach((dropdown: Dropdown) => dropdown.active = false);
    }

    public checkDropdown(name: string): boolean {
        return this.dropdowns.filter((dropdown: Dropdown) => dropdown.name == name)?.[0]?.active;
    }

}