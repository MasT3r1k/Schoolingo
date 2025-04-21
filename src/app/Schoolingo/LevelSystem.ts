export class LevelSystem {
    private level = 1;
    private XP = 0;
    private startXP = 0;
    private requiredXP = 1;

    public setLevelInfo(level: number, start: number, xp: number, required: number): void {
        this.level = level;
        this.XP = xp;
        this.startXP = start;
        this.requiredXP = required;
    }

    public getLevel(): number {
        return this.level;
    }

    public getXP(): number {
        return this.XP;
    }

    public getProgress(): number {
        if (!this.requiredXP) return 0;
        let a = (this.XP - this.startXP) / this.requiredXP * 100;
        return a;
    }

    public getStartXP(): number {
        return this.startXP;
    }

    public getRequiredXP(): number {
        return this.requiredXP;
    }
}