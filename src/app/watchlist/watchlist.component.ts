import { Component, OnInit, AfterViewInit, OnChanges, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PropertyService } from '../property/property.service';
import { SearchService } from '../search/search.service';
import { NgbModal, ModalDismissReasons } from '../ui/index';
import * as moment from 'moment/moment';

@Component({
  moduleId: module.id,
  selector: 'app-watchlist',
  templateUrl: 'watchlist.component.html',
  styleUrls: ['watchlist.component.css']
})
export class WatchlistComponent implements OnInit, AfterViewInit, OnChanges {
  searchService: SearchService;
  propertyService: PropertyService;
  page: number;
  columns: Array<string>;
  modalColumns: Array<string>;
  protected elementRef: ElementRef;
  protected summaryProperty: string = null;
  initialized: boolean;

  constructor(
    private router: Router,
    searchService: SearchService,
    propertyService: PropertyService,
    private modalService: NgbModal,
    elementRef: ElementRef
  ) {
    this.searchService = searchService;
    this.propertyService = propertyService;
    this.elementRef = elementRef;
    this.columns = [];
  }

  ngOnInit() {
      this.page = 0;
      this.search();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.searchService.watchlistProperties.length > 0) {
        this.initialized = true;
        this.initPlugins();
      }
    });
  }

  isSearchReady() {
    if (!this.initialized && (this.searchService.watchlistProperties.length > 0)) {
      this.initialized = true;
      setTimeout(() => {
        this.initPlugins();
      });
    }
    return (this.searchService.watchlistProperties.length > 0);
  }

  initPlugins() {
    try {
      $(this.elementRef.nativeElement)["find"]('.widget.table table')["dragtable"]({dragaccept:'.sortable'});
      $(this.elementRef.nativeElement)["find"]('.lightbox')["photobox"]('a',{ time:0 });
    } catch (e) {
      console.warn('Failed to initialize plugins in watchlist component: ', e);
    }
  }

  ngOnChanges() {
    setTimeout(() => {
      this.page = 0;
      this.search();
    });
  }

  search() {
    this.searchService.watchlistPage = this.page;
    this.searchService.getFullWatchlistProperties((error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  formatDate(dt, fmt) {
    return moment(dt).format(fmt);
  }

  toggleWatchlistSearchListing(id: any) {
    this.searchService.toggleWatchlistSearchListing(id, (error:any, caught: Observable<any>) => {
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

    togglePropertySummary(property: any) {
        if (!this.summaryProperty || (this.summaryProperty !== this.propertyService.getPropertyId(property.bippoProperty))) {
          this.summaryProperty = this.propertyService.getPropertyId(property.bippoProperty);
        } else {
          this.summaryProperty = null;
        }
    }

    isPropertySummaryOpen(property: any) {
        return this.summaryProperty &&
            (this.summaryProperty === this.propertyService.getPropertyId(property.bippoProperty));
    }

    roundDom(dom) {
      for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
      return '> 365';
    }
}
