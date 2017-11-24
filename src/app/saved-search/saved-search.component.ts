import { Component, OnInit } from '@angular/core';
import { IPaginationInstance } from '../ng2-pagination/ng2-pagination';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { SearchModel } from '../search/search.model';
import { Base64, SearchService } from '../search/search.service';

@Component({
  moduleId: module.id,
  selector: 'app-saved-search',
  templateUrl: 'saved-search.component.html',
  styleUrls: ['saved-search.component.css']
})
export class SavedSearchComponent implements OnInit {
  searchService: SearchService;
  page: number;

  constructor(private router: Router, searchService: SearchService) {
    this.searchService = searchService;
    this.page = 0;
  }

  ngOnInit() {
    this.search();
  }

  search() {
    this.searchService.getSavedSearches(this.page, (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  viewSavedSearch(savedSearch: any) {
    let searchFilter = Object.assign(savedSearch.searchFilter);
    searchFilter.searchid = savedSearch.id;
    searchFilter.searchName = savedSearch.searchName;
    let query:SearchModel = new SearchModel(searchFilter);
    let encodedQuery = Base64.encode(JSON.stringify(query));
    this.router.navigate(['/search-results', encodedQuery]);
  }

  deleteSavedSearch(id: number) {
    this.searchService.deleteSavedSearch(id, (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }
}
