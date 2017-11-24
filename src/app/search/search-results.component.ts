import { Component, ViewChild, Output, OnInit, AfterViewInit, OnChanges, ElementRef } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { PropertyService } from '../property/property.service';
import { SearchService } from './search.service';
import { PaginationService, IPaginationInstance } from '../ng2-pagination/ng2-pagination';
import { NgbModal, ModalDismissReasons } from '../ui/index';

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
    selector: 'app-search-results',
    templateUrl: 'search-results.component.html',
    inputs: ['searchQuery']
})
export class SearchResultsComponent implements OnInit, AfterViewInit, OnChanges {

    searchService: SearchService;
    propertyService: PropertyService;
    searchQuery: any;
    page: number;
    columns: Array<string>;
    modalColumns: Array<string>;
    protected elementRef: ElementRef;
    protected summaryProperty: string = null;
    initialized: boolean;

    constructor(
        private router: Router,
        propertyService: PropertyService,
        searchService: SearchService,
        private modalService: NgbModal,
        elementRef: ElementRef) {
        this.columns = [];
        this.searchService = searchService;
        this.propertyService = propertyService;
        this.elementRef = elementRef;
    }

    ngOnInit() {
      this.initialized = false;
      this.page = (("undefined" !== typeof this.searchQuery) &&
        (this.searchQuery) &&
        ("undefined" !== typeof this.searchQuery["page"])) ?
        this.searchQuery["page"] : 0;
      this.searchService.getWatchlistProperties((error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
      this.searchService.getIgnoredListings((error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
    }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.searchService.properties.length > 0) {
        this.initialized = true;
        this.initPlugins();
      }
    });
  }

  initPlugins() {
    try {
      $(this.elementRef.nativeElement)["find"]('.widget.table table')["dragtable"]({dragaccept:'.sortable', dragHandle:'.sorthandle'});
      $(this.elementRef.nativeElement)["find"]('.lightbox')["photobox"]('a',{ time:0 });
    } catch (e) {
      console.warn('Error initializing plugins in search-results component: ', e);
    }
  }

  ngOnChanges() {
    setTimeout(() => {
      this.page = 0;
      this.search();
    });
  }

  isSearchReady() {
    if (!this.initialized && (this.searchService.properties.length > 0)) {
      this.initialized = true;
      setTimeout(() => {
        this.initPlugins();
      });
    }
    return (this.searchService.properties.length > 0);
  }

    sort(event: any, field: string) {
      console.log("Sorting by", field);
      if (field === this.searchService.sortBy) {
        this.searchService.sortDir = ("+" === this.searchService.sortDir) ? "-" : "+";
      } else {
        this.searchService.sortBy = field;
        this.searchService.sortDir = "+";
      }
      this.page = 0;
      this.search();
    }

    search() {
      if (this.page < 1) {
          this.searchQuery["page"] = this.page;
      } else {
          this.searchQuery["page"] = this.page - 1;
      }

      if ("undefined" !== typeof this.searchQuery["searchid"]) {
        console.log("getSavedSearch('" + this.searchQuery["searchid"] + "')");
        this.searchService.getSavedSearchPage(this.searchQuery["searchid"], this.searchQuery["page"], (error:any, caught: Observable<any>) => {
          console.log(error);
          return caught;
        });
      } else {
        this.searchService.search.update(this.searchQuery);
        this.searchService.getAdvanceSearchPage(this.searchQuery, this.searchQuery["page"], (error:any, caught: Observable<any>) => {
          console.log(error);
          return caught;
        });
      }
    }

    togglePropertySummary(property: any) {
        if (!this.summaryProperty || (this.summaryProperty !== this.propertyService.getPropertyId(property))) {
          this.summaryProperty = this.propertyService.getPropertyId(property);
        } else {
          this.summaryProperty = null;
        }
    }

    isPropertySummaryOpen(property: any) {
        return this.summaryProperty &&
            (this.summaryProperty === this.propertyService.getPropertyId(property));
    }

    toggleWatchlistSearchListing(id: string) {
      this.searchService.toggleWatchlistSearchListing(id, (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
    }

    ignoreSearchListing(id: string) {
      this.searchService.ignoreSearchListing(id, (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
    }

    viewProperty(property: any) {
      this.router.navigate(['/property', this.searchService.getPropertyId(property)]);
    }

    hasColumn(fieldname: string) {
      return (-1 !== this.columns.indexOf(fieldname));
    }

    hasModalColumn(fieldname: string) {
      return (-1 !== this.modalColumns.indexOf(fieldname));
    }

    toggleModalColumn(fieldname: string) {
      let pos = this.modalColumns.indexOf(fieldname);
      if (-1 === pos) {
        this.modalColumns.push(fieldname);
      } else {
        this.modalColumns.splice(pos, 1);
      }
    }

    addColumns(columns: Array<string>) {
        this.columns = this.modalColumns;
    }

    showAddColumnModal(content) {
        console.log("Show add column modal!");
        event.preventDefault();
        this.modalColumns = this.columns;
        this.modalService.open(content).result.then((result) => {
          // Do nothing
        }, (reason) => {
          // Do nothing
        });
    }

    roundDom(dom) {
      for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
      return '> 365';
    }
}
