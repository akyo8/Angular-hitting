import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-tax',
  templateUrl: 'property-tax.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyTaxComponent implements OnInit, AfterViewInit {
  private _property: any;
  private _subjectProperty: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }

  propertyService: PropertyService;
  searchService: SearchService;
  taxTab: number;
  curYear: number;
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
    this.taxTab = 1;
    this.curYear = moment().year();
  }

  ngAfterViewInit() {
    try {
      this.touchPanes = jQuery(this.element.nativeElement)["find"](".tabswrapper .panes")["touchPanes"]({
        "change": (tab) => {
          this.taxTab = tab + 1;
        }
      });
      this.touchPanes.init();
    } catch (e) {
      console.warn('Error initializing touch panes in property-tax component: ', e);
    }
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }

  setTaxTab(tab: number) {
    this.taxTab = tab;
  }
}
