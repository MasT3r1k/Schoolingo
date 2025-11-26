export interface ContextMenuItem {
    icon?: string | undefined;
    type?: 'split';
    color?: 'danger';
    text?: string | undefined;
    action?: Function
}

export class ContextMenu {
    private pos = { x: 0, y: 0 };
    private isVisible: boolean = false;
    private items: ContextMenuItem[] = [];

    public showContextMenu(x: number, y: number): void {
        this.pos = { x, y };
        this.isVisible = true;
    }

    public getPosition(): typeof this.pos {
        return this.pos;
    }

    public hideContextMenu(): void {
        this.isVisible = false;
    }

    public isVisibleContextMenu(): boolean {
        return this.isVisible;
    }

    public getItems(): ContextMenuItem[] {
        return this.items;
    }
    
    public addItems(items: ContextMenuItem[] = []): void {
        this.items.push(...items);
    }

    public clearItems(): void {
        this.items = [];
    }

    public setItems(items: ContextMenuItem[] = []): void {
        this.items = items;
    }
}