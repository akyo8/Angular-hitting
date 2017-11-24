import {Injectable, Inject} from "@angular/core";

import {LocalData} from "./local-data";
import {RemoteData} from "./remote-data";


@Injectable()
export class CompleterService {
    constructor(
        @Inject(LocalData) private localDataFactory: () => LocalData,
        @Inject(RemoteData) private remoteDataFactory: () => RemoteData
    ) { }

    public local(data: any[], searchFields: string, titleField: string) {

        let localData = this.localDataFactory();
        return localData
            .data(data)
            .searchFieldss(searchFields)
            .titleField(titleField);
    }

    public remote(url: string, searchFields: string, titleField: string) {

        let remoteData = this.remoteDataFactory();
        return remoteData
            .remoteUrl(url)
            .searchFieldss(searchFields)
            .titleField(titleField);
    }
}
