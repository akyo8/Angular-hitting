import {Observable} from "rxjs/Observable";

import {CompleterItem} from "../completer-item";

export interface CompleterData extends Observable<CompleterItem[]>{
    search(term: string): void;
    cancel(): void;
};