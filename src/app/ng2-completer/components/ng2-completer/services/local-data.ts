import {Injectable} from "@angular/core";

import {CompleterBaseData} from "./completer-base-data";

@Injectable()
export class LocalData extends CompleterBaseData  {

    private _data: any[];

    constructor() {
        super();
    }

    public data(data: any[]) {
        this._data = data;
        return this;
    }

    public search(term: string): void {
        let matches: any[] = this.extractMatches(this._data, term);

        this.next(this.processResults(matches, term));
    }
}
