import {Subject} from "rxjs/Subject";

import {CompleterItem} from "../completer-item";
import {CompleterData} from "./completer-data";

export abstract class CompleterBaseData extends Subject<CompleterItem[]> implements CompleterData {


    protected _searchFields: string;
    protected _titleField: string;
    protected _descriptionField: string;
    protected _imageField: string;

    constructor() {
        super();
    }

    public abstract search(term: string): void;

    public cancel() { }

    public searchFieldss(searchFields: string) {
        this._searchFields = searchFields;
        return this;
    }

    public titleField(titleField: string) {
        this._titleField = titleField;
        return this;
    }

    public descriptionField(descriptionField: string) {
        this._descriptionField = descriptionField;
        return this;
    }

    public imageField(imageField: string) {
        this._imageField = imageField;
        return this;
    }

    protected extractMatches(data: any[], term: string) {
        let matches: any[] = [];
        let searchFields = this._searchFields.split(",");
        for (let i = 0; i < data.length; i++) {
            let match = false;
            for (let s = 0; s < searchFields.length; s++) {
                let value = this.extractValue(data[i], searchFields[s]) || "";
                match = match || (value.toString().toLowerCase().indexOf(term.toString().toLowerCase()) >= 0);
            }

            if (match) {
                matches[matches.length] = data[i];
            }
        }

        return matches;
    }

    protected extractTitle(item: any) {
        // split title fields and run extractValue for each and join with ' '
        return this._titleField.split(",")
            .map((field) => {
                return this.extractValue(item, field);
            })
            .join(" ");
    }

    protected extractValue(obj: any, key: string) {
        let keys: string[];
        let result: any;
        if (key) {
            keys = key.split(".");
            result = obj;
            for (let i = 0; i < keys.length; i++) {
                if (result) {
                    result = result[keys[i]];
                }
            }
        }
        else {
            result = obj;
        }
        return result;
    }

    protected processResults(matches: string[], term: string): CompleterItem[] {
        let i: number;
        let description: string;
        let image: string;
        let text: string;
        let formattedText: string;
        let formattedDesc: string;
        let results: CompleterItem[] = [];

        if (matches && matches.length > 0) {

            for (i = 0; i < matches.length; i++) {
                if (this.titleField && this._titleField !== "") {
                    text = formattedText = this.extractTitle(matches[i]);
                }

                description = "";
                if (this._descriptionField) {
                    description = formattedDesc = this.extractValue(matches[i], this._descriptionField);
                }

                image = "";
                if (this._imageField) {
                  image = this.extractValue(matches[i], this._imageField);
                }

                // if (scope.matchClass) {
                //   formattedText = findMatchString(text, str);
                //   formattedDesc = findMatchString(description, str);
                // }

                results.push({
                    title: formattedText,
                    description: formattedDesc,
                    image: image,
                    originalObject: matches[i]
                });
            }

        }

        // if (scope.autoMatch && scope.results.length === 1 &&
        //     checkExactMatch(scope.results[0],
        //       {title: text, desc: description || ''}, scope.searchStr)) {
        //   scope.showDropdown = false;
        // } else if (scope.results.length === 0 && !displayNoResults) {
        //   scope.showDropdown = false;
        // } else {
        //  this.showDropdown = true;
        // }

        return results;
    }
}
