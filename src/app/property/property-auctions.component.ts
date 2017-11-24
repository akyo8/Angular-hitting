import { Component, OnInit, AfterViewInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-auctions',
  templateUrl: 'property-auctions.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyAuctionsComponent implements OnInit, AfterViewInit {
  private _property: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }

  propertyService: PropertyService;
  searchService: SearchService;
  auctionTab: number;
  private element: ElementRef;
  touchPanes: any;

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this._property = {};
  }

  ngOnInit() {
    this.auctionTab = 2;
  }

  ngAfterViewInit() {
    this.touchPanes = jQuery(this.element.nativeElement)["find"](".tabswrapper .panes")["touchPanes"]({
      "change": (tab) => {
        this.auctionTab = tab + 1;
      }
    });
    this.touchPanes.init();
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }

  setAuctionTab(tab: number) {
    this.auctionTab = tab;
  }

  standardizeYesNo(value) {
    if (isNaN(value)) {
      return value;
    } else if (value == 0) {
      return "No";
    } else if (value == 1) {
      return "Yes";
    }

    return value ? "Yes" : "No";
  }
}
