import { Component, OnInit, AfterViewInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-info',
  templateUrl: 'property-info.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyInfoComponent implements OnInit, AfterViewInit {
  private _property: any;
  private _subjectProperty: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }
  @Input()
  set subjectProperty(property: any) {
    this._subjectProperty = property;
  }
  @Input() mode: string = "complete";

  @Input() hasClose: boolean = false;

  @Output() public close: EventEmitter<any> = new EventEmitter<any>();

  propertyService: PropertyService;
  searchService: SearchService;
  infoTab: number;
  curYear: number;
  ninjaSliderId: string;
  thumbSliderId: string;
  private element: ElementRef;
  touchPanes: any;
  ninjaSlider: any

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this._property = {};
  }

  ngOnInit() {
    this.infoTab = 1;
    this.curYear = moment().year();
    let sliderIndex = String(Math.floor(Math.random() * (99999 - 10000)) + 10000);
    this.ninjaSliderId = "ninja-slider" + sliderIndex;
    this.thumbSliderId = "thumb-slider" + sliderIndex;
  }

  ngAfterViewInit() {
    var initSliders;

    if (this.propertyService.getFirstPhoto(this._property)) {
      initSliders = this.propertyService.initSliders(this.ninjaSliderId, this.thumbSliderId);

      if (initSliders) {
        this.ninjaSlider = initSliders.ninjaSlider;
      } else {
        console.log('We were supposed to have photos, but initSliders() returned null!');
      }
    }

    try {
      this.touchPanes= jQuery(this.element.nativeElement)["find"](".tabswrapper .panes")["touchPanes"]({
        "change": (tab) => {
          this.infoTab = tab + 1;
        }
      });
      this.touchPanes.init();
    } catch (e) {
      console.warn('Error initializing touch panes in property-info component: ', e);
    }
  }

  showImage(index) {
    this.ninjaSlider.displaySlide(index);
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }

  getSubjectProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._subjectProperty, valueset);
  }

  setInfoTab(tab: number) {
    this.infoTab = tab;
  }

  closeInfo(event) {
    event.preventDefault();
    this.close.emit(null);
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
