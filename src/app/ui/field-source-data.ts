import {Injectable} from "@angular/core";

import { CompleterBaseData } from "../ng2-completer/ng2-completer";

@Injectable()
export class FieldSourceData extends CompleterBaseData  {

    private _fieldname: string;
    private _fieldref: any;

    constructor(fieldname: string, fieldref: any) {
        super();
        this._fieldname = fieldname;
        this._fieldref = fieldref;
    }

    public search(term: string): void {
        let matches: any[] = [];
        if (("undefined" !== typeof this._fieldref) &&
          ("undefined" !== typeof this._fieldref[this._fieldname])) {
          matches = this.extractMatches(this._fieldref[this._fieldname], term);
        }

        this.next(this.processResults(matches, term));
    }
}