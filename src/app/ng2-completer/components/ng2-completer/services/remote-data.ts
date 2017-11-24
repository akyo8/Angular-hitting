import {Http, Response} from "@angular/http";
import {Subscription} from "rxjs/Subscription";
import "rxjs/add/operator/map";


import {CompleterBaseData} from "./completer-base-data";

export class RemoteData extends CompleterBaseData {
    private _remoteUrl: string;
    private remoteSearch: Subscription;
    private _urlFormater: (term: string) => string = null;

    constructor(private http: Http) {
        super();
    }

    public remoteUrl(remoteUrl: string) {
        this._remoteUrl = remoteUrl;
        return this;
    }

    public urlFormater(urlFormater: (term: string) => string) {
        this._urlFormater = urlFormater;
    }

    public search(term: string): void {
        this.cancel();
        // let params = {};
        let url = "";
        if (this._urlFormater) {
            url = this._urlFormater(term);
        } else {
            url = this._remoteUrl + encodeURIComponent(term);
        }

        this.remoteSearch = this.http.get(url)
            .map((res: Response) => res.json())
            .map((data: any) => {
                return this.extractMatches(data, term);
            })
            .map(
            (matches: any[]) => {
                let results = this.processResults(matches, term);
                this.next(results);
                return results;
            })
            .catch((err) => {
                this.error(err);
                return null;
            })
            .subscribe();
    }

    public cancel() {
        if (this.remoteSearch) {
            this.remoteSearch.unsubscribe();
        }
    }


}
