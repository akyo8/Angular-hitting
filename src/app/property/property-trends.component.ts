import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-trends',
  templateUrl: 'property-trends.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyTrendsComponent implements OnInit, AfterViewInit {
  private _property: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }

  propertyService: PropertyService;
  searchService: SearchService;
  trendsTab: number;
  ninjaSliderId: string;
  thumbSliderId: string;
  private element: ElementRef;
  statusIndexes: any;
  currentPages: any;
  touchPanes: any;
  expandedStatus: string;
  protected summaryProperty: string = null;

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this._property = {};
    this.expandedStatus = null;
  }

  ngOnInit() {
    this.trendsTab = 1;
    this.currentPages = {};
    this.statusIndexes = {};
    let sliderIndex = String(Math.floor(Math.random() * (99999 - 10000)) + 10000);
    this.ninjaSliderId = "ninja-slider" + sliderIndex;
    this.thumbSliderId = "thumb-slider" + sliderIndex;
    this.propertyService.getAreaPropertyListings(this.propertyService.getPropertyId(this._property),
      () => {
        this.setupTouchPanes();
      }, (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  setupTouchPanes() {
//    setTimeout(() => {
        try {
          this.touchPanes = jQuery(this.element.nativeElement)["find"](".tabswrapper .panes")["touchPanes"]({
              "change": tab => {
                  this.trendsTab = tab + 1;
              }
          });
          this.touchPanes.init();
        } catch (e) {
          console.warn('Error initializing touch panes in property-trends component: ', e);
        }
//    }, 50);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.touchPanes = jQuery(this.element.nativeElement)["find"](".tabswrapper .panes")["touchPanes"]({
        "change": (tab) => {
          this.trendsTab = tab + 1;
        }
      });
      this.touchPanes.init();
    }, 5000);
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }

  setTrendsTab(tab: number) {
    this.trendsTab = tab;
  }

  changeStatus(status: string) {
    this.touchPanes.changePane(this.groupStatusIndex(status) - 1);
  }

  groupStatusIndex(status: string) {
    let group: any;
    let index: number;
    if ("undefined" === typeof this.statusIndexes[status]) {
      index = 0;
      for (group of this.propertyService.areaPropertyGroups) {
        index++;
        this.statusIndexes[group.status] = index;
      }
    }

    return this.statusIndexes[status];
  }

  toggleStatus(status: string) {
    if (this.expandedStatus !== status) {
      this.expandedStatus = status;
    } else {
      this.expandedStatus = null;
    }
  }

  isExpanded(status: string) {
    return this.expandedStatus === status;
  }

  getCurrentPage(status: string) {
    return ("undefined" !== typeof this.currentPages[status]) ? this.currentPages[status] : 0;
  }

  setCurrentPage(status: string, p: number) {
    this.currentPages[status] = p;
  }

  roundDom(dom) {
    for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
    return '> 365';
  }

  togglePropertySummary(property: any) {
    if (!this.summaryProperty || (this.summaryProperty !== this.propertyService.getPropertyId(property))) {
      this.summaryProperty = this.propertyService.getPropertyId(property);
    } else {
      this.summaryProperty = null;
    }
  }

  isPropertySummaryOpen(property: any) {
    return this.summaryProperty && (this.summaryProperty === this.propertyService.getPropertyId(property));
  }

  pricePerFootage(price, footage) {
    return Number(String(price).replace(/\D/g, "")) / Number(String(footage).replace(/\D/g, ""));
  }
}
