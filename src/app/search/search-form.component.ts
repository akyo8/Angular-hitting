import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Base64, SearchService } from '../search/search.service';
import { Router } from '@angular/router';
import {Observable} from 'rxjs/Rx';

@Component({
  moduleId: module.id,
  selector: 'app-search-form',
  inputs: ['mode', 'clear'],
  templateUrl: 'search-form.component.html',
  styleUrls: ['search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  mode: string;
  searchQuery: any;
  searchService: SearchService;
  clear: boolean;

  constructor(private router: Router,
    private ref: ChangeDetectorRef,
    searchService: SearchService) {
    this.searchService = searchService;
  }

  ngOnInit() {
    if (this.clear) {
      this.searchService.resetSearch();
    }
    this.searchService.getSearchMetadata((error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
    /*
    this.searchService.getMlsStatuses();
    this.searchService.getCounties();
    this.searchService.getSchoolDistricts();
    this.searchService.getPropertyTypes();
    */
    this.searchService.getStories();
    this.searchService.getConditions();
    this.searchService.getDomRanges();
  }

  doChange() {
    // Do nothing, just trigger update cycle; this fixes the checkmarks
    // on the search form not updating when clicked on.
  }

  onSubmit() {
    if (!this.searchService.search.searchName || ("" === this.searchService.search.searchName)) {
      this.searchService.search.searchName = "Default Search";
    }
    if ("advance" === this.mode) {
      let encodedQuery = Base64.encode(JSON.stringify(this.searchService.search));
    console.log("query", this.searchService.search);
      this.router.navigate(['/search-results', encodedQuery]);
    } else {
      this.searchService.setAdvanceSearchQuery(this.searchService.search);
      this.searchService.createUpdateSavedSearch((error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
    }
  }

  update() {
    // Need this in order to detect when list price from/to is
    // rounded off after moving the slider.
    this.ref.detectChanges();
  }
}
