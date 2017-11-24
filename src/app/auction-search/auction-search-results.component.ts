import { Component, OnInit, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute }  from '@angular/router';
import { SearchService } from '../search/search.service';
import { IPaginationInstance } from '../ng2-pagination/ng2-pagination';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';


export interface PagedResponse<T> {
    total: number;
    data: T[];
}

export interface DataModel {
    id: number;
    data: string;
}

@Component({
    moduleId: module.id,
    selector: 'app-auction-search-results',
    templateUrl: 'auction-search-results.component.html'
})
export class AuctionSearchResultsComponent implements OnInit {
    private sub: any;
    search_query: string;
    query_params: any;
    county: string;
    searchService: SearchService;
    page: number;

    constructor(
            private route: ActivatedRoute,
            private router: Router,
            searchService: SearchService) {

        this.searchService = searchService;
        this.page = 0;
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            let query = decodeURIComponent(params['query']);
            if (query == undefined) {
                query = '';
            }
            this.search_query = query;
            this.query_params = this.parseRawQueryString(query);
            console.log('query_params', this.query_params);
            this.county = this.query_params["county"];
            if ('' !== query) {
              this.search();
            } else {
              this.searchService.resetSearch();
            }
        });
    }

    search() {
      this.searchService.getAuctionSearch(this.search_query, this.page, (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    parseRawQueryString(query) {
      let urlParams = {};
      let search = /([^&=]+)=?([^&]*)/g;
      let match;

      while (match = search.exec(query)) {
         urlParams[this.decode(match[1])] = this.decode(match[2]);
      }

      return urlParams;
    }

    decode(input) {
      return decodeURIComponent(input.replace(/\+/g, " "));
    }
}
