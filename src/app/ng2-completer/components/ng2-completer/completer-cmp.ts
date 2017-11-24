"use strict";
import {Component, Input, Output, EventEmitter, OnInit, ViewChild, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

import {Observable} from "rxjs/Observable";

import {CompleterListCmp} from "./completer-list-cmp";
import {CompleterData} from "./services/completer-data";
import {CompleterItem} from "./completer-item";

import "rxjs/add/operator/catch";

// keyboard events
const KEY_DW = 40;
const KEY_RT = 39;
const KEY_UP = 38;
const KEY_LF = 37;
const KEY_ES = 27;
const KEY_EN = 13;
const KEY_TAB = 9;

const MIN_SEARCH_LENGTH = 3;
const MAX_CHARS = 524288;  // the default max length per the html maxlength attribute
const PAUSE = 250;
const BLUR_TIMEOUT = 200;
const TEXT_SEARCHING = "Searching...";
const TEXT_NORESULTS = "No results found";

const noop = () => { };

const COMPLETER_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CompleterCmp),
    multi: true
};

@Component({
    selector: "ng2-completer",
    templateUrl: "completer-cmp.html",
    styleUrls: ["completer-cmp.css"],
    providers: [COMPLETER_CONTROL_VALUE_ACCESSOR]
})
export class CompleterCmp implements OnInit, ControlValueAccessor {
    @Input() public dataService: CompleterData;
    @Input() public searchFields = "";
    @Input() public inputName = "";
    @Input() public pause = PAUSE;
    @Input() public minSearchLength = MIN_SEARCH_LENGTH;
    @Input() public maxChars = MAX_CHARS;
    @Input() public overrideSuggested = false;
    @Input() public clearSelected = false;
    @Input() public placeholder = "";
    @Input() public matchClass: string;
    @Input() public textSearching = TEXT_SEARCHING;
    @Input() public textNoResults = TEXT_NORESULTS;
    @Input() public fieldTabindex: number;
    @Input() public autoMatch = false;
    @Input() public disableInput = false;
    @Output() public selected = new EventEmitter<CompleterItem>();

    @ViewChild(CompleterListCmp) private listCmp: CompleterListCmp;

    private searchStr = "";
    private searching = false;
    private showDropdown = false;
    private displayNoResults = true;
    private searchTimer: any = null;
    private hideTimer: any = null;
    private displaySearching = true;
    private selectedObject: CompleterItem = null;
    private results: CompleterItem[] = [];
    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    constructor() { }

    get value(): any { return this.searchStr; };

    set value(v: any) {
        if (v !== this.searchStr) {
            this.searchStr = v;
            this._onChangeCallback(v);
        }
    }

    public onTouched() {
        this._onTouchedCallback();
    }

    public writeValue(value: any) {
        this.searchStr = value;
    }

    public registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    public keyupHandler(event: any) {
        if (event.keyCode === KEY_LF || event.keyCode === KEY_RT) {
            // do nothing
            return;
        }

        if (event.keyCode === KEY_UP || event.keyCode === KEY_EN) {
            event.preventDefault();
        }
        else if (event.keyCode === KEY_DW) {
            event.preventDefault();
            if (!this.showDropdown && this.searchStr && this.searchStr.length >= this.minSearchLength) {
                this.initResults();
                this.searching = true;
                this.searchTimerComplete(this.searchStr);
            }
        }
        else if (event.keyCode === KEY_ES) {
            this.clearResults();
        }
        else {
            this._onChangeCallback(this.searchStr);
            if (!this.searchStr) {
                this.showDropdown = false;
                return;
            }
            if (this.searchStr === "") {
                this.showDropdown = false;
            }
            else if (this.searchStr.length >= this.minSearchLength) {
                this.initResults();

                if (this.searchTimer) {
                    clearTimeout(this.searchTimer);
                }

                this.searching = true;

                this.searchTimer = setTimeout(
                    () => {
                        this.searchTimerComplete(this.searchStr);
                    },
                    this.pause
                );
            }
        }

    }

    public keydownHandler(event: any) {
        if(!this.listCmp){
            return;
        }

        if (event.keyCode === KEY_EN && this.results) {
            if (this.listCmp.currentIndex >= 0 && this.listCmp.currentIndex < this.results.length) {
                event.preventDefault();
                this.selectResult(this.results[this.listCmp.currentIndex]);
            } else {
                this.handleOverrideSuggestions(event);
                this.clearResults();
            }
        } else if (event.keyCode === KEY_DW && this.results) {
            event.preventDefault();
            if (this.showDropdown && (this.listCmp.currentIndex + 1) < this.results.length) {
                this.listCmp.incIndex();
                this.searchStr = this.results[this.listCmp.currentIndex].title;
            }
        } else if (event.keyCode === KEY_UP && this.results) {
            event.preventDefault();
            if (this.showDropdown && this.listCmp.currentIndex >= 1) {
                this.listCmp.decIndex();
                this.searchStr = this.results[this.listCmp.currentIndex].title;
            }
            else if (this.showDropdown && this.listCmp.currentIndex === 0) {
                this.listCmp.unselect();
            }
        } else if (event.keyCode === KEY_TAB) {
            if (this.results && this.results.length > 0 && this.showDropdown) {
                if (this.listCmp.currentIndex === -1 && this.overrideSuggested) {
                    // intentionally not sending event so that it does not
                    // prevent default tab behavior
                    this.handleOverrideSuggestions();
                }
                else {
                    if (this.listCmp.currentIndex === -1) {
                        this.listCmp.toTop();
                    }
                    this.selectResult(this.results[this.listCmp.currentIndex]);
                }
            }
            else {
                // no results
                // intentionally not sending event so that it does not
                // prevent default tab behavior
                if (this.searchStr && this.searchStr.length > 0) {
                    this.handleOverrideSuggestions();
                }
            }
        } else if (event.keyCode === KEY_ES) {
            // This is very specific to IE10/11 #272
            // without this, IE clears the input text
            event.preventDefault();
        }
    }

    public ngOnInit() {

        if (this.textNoResults === "false") {
            this.displayNoResults = false;
        }
        if (this.textSearching === "false") {
            this.displaySearching = false;
        }
        this.selected.subscribe(() => {
            this.clearResults();
        });
        this.dataService
            .catch(err => this.handleError(err))
            .subscribe(results => {
                this.searching = false;
                this.results = results;
                if (this.autoMatch && this.results.length === 1 &&
                    this.results[0].title.toLocaleLowerCase() === this.searchStr.toLocaleLowerCase()) {
                    this.showDropdown = false;
                } else if (this.results.length === 0 && !this.displayNoResults) {
                    this.showDropdown = false;
                } else {
                    this.showDropdown = true;
                }
            });
    }

    public selectResult(result: any) {
        this.searchStr = result.title;
        this._onChangeCallback(this.searchStr);
        this.callOrAssign(result);
        if (this.clearSelected) {
            this.searchStr = null;
        }

        this.clearResults();
    };

    public hideResults() {

        this.hideTimer = setTimeout(
            () => {
                this.clearResults();
            },
            BLUR_TIMEOUT);

        if (this.overrideSuggested) {
            if (this.searchStr && this.searchStr.length > 0 && this.listCmp && this.listCmp.currentIndex === -1) {
                this.handleOverrideSuggestions();
            }
        } else {
            if (this.listCmp && this.listCmp.currentIndex >= 0) {
                this.selectResult(this.results[this.listCmp.currentIndex]);
            }
        }
        this.dataService.cancel();

    };

    public onBlur() {
        this.onTouched();
        this.hideResults();
    }

    private initResults() {
        this.showDropdown = this.displaySearching;
        this.results = [];
    }

    private searchTimerComplete(str: string) {
        // Begin the search
        if (!str || str.length < this.minSearchLength) {
            return;
        }
        this.dataService.search(str);
    }


    private clearResults() {
        this.results = [];
        this.showDropdown = false;
    }

    private handleOverrideSuggestions(event?: any) {
        if (this.overrideSuggested &&
            !(this.selectedObject && this.selectedObject.originalObject === this.searchStr)) {
            if (event) {
                event.preventDefault();
            }

            // cancel search timer
            clearTimeout(this.searchTimer);
            // cancel http request
            this.dataService.cancel();
            this.setInputString(this.searchStr);
        }
    }

    private setInputString(str: string) {
        this.callOrAssign({
            title: null,
            originalObject: str
        });

        if (this.clearSelected) {
            this.searchStr = null;
        }
        this.clearResults();
    }

    private callOrAssign(value: CompleterItem) {
        this.selectedObject = value;
        this.selected.emit(value);
    }

    private handleError(error: any) {
        this.searching = false;
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : "Server error";
        if (console && console.error) {
            console.error(errMsg); // log to console 
        }

        return Observable.throw(errMsg);
    }
}
