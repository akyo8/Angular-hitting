import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import {Observable} from 'rxjs/Rx';
import { Base64, SearchService } from './search.service';

@Component({
    moduleId: module.id,
    selector: 'app-search-results-wrapper',
    templateUrl: 'search-results-wrapper.component.html'
})
export class SearchResultsWrapperComponent implements OnInit, OnDestroy {
    private sub: any;
    searchid: string;
    searchName: string;
    searchQuery: any;
    activeTab: string;
    searchService: SearchService;

    constructor(private route: ActivatedRoute,
        private router: Router, searchService: SearchService) {
      this.searchService = searchService;
    }

    doChange() {
      console.log("Search", this.searchService.search);
    }

    ngOnInit() {
        this.activeTab = "search-results";
        this.searchid = null;
        this.searchName = null;
        this.searchQuery = null;
        this.sub = this.route.params.subscribe(params => {
            this.activeTab = "search-results";
            let query = params['query'];
            if (typeof query === "undefined") {
              query = '';
            }
            if ('' !== query) {
              let decodedQuery:any = Base64.decode(query);
              // Somehow we get a trailing null character which causes JSON.parse
              // to fail.  This line fixes it.
              decodedQuery = decodedQuery.substr(0, decodedQuery.lastIndexOf("}") + 1);
              if (decodedQuery) {
                this.searchQuery = JSON.parse(decodedQuery);
                if ("undefined" !== typeof this.searchQuery["searchid"]) {
                  this.searchid = this.searchQuery["searchid"];
                }
                if ("undefined" !== typeof this.searchQuery["searchName"]) {
                  this.searchName = this.searchQuery["searchName"];
                }
              }
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}