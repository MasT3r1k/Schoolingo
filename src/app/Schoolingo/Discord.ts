export class Discord {
    public isLoading = true;

    private data = {};
    public getData(): typeof this.data {
        return this.data;
    }

    public checkData(): boolean {
        return Object.keys(this.data).length > 0
    }

    public loadData(): void {
        // Http post request to load data from core system

        // Testing, don't have core system yet :(
        this.isLoading = false;
    }
}