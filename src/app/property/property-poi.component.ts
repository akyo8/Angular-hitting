import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-poi',
  templateUrl: 'property-poi.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyPoiComponent implements OnInit, AfterViewInit {
  private _property: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }

  propertyService: PropertyService;
  searchService: SearchService;
  private element: ElementRef;
  touchPanes: any;
  poi: any = {};
  poiIndexed: any = [];
  poiIndices: Array<string> = [];
  poiShown: Array<boolean> = [];
  poiArea: string = "";

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this._property = {};
  }

  ngOnInit() {
    let zipcode = this.getProperty().address.postal1;

    this.poiArea = String(zipcode);
    this.propertyService.getPoi(zipcode,
      () => {
        let p = this.propertyService.poiData || [];

        this.poi = p;

        let indices = [];
        let indexed = [];
        let shown = [];

        for (let i = 0; i < p.length; i++) {
          if (p[i].business) {
            let x = indices.indexOf(p[i].business);

            if (x < 0) {
              x = indices.length;
              indices.push(p[i].business);
              indexed.push([]);
              shown.push(false);
            }

            indexed[x].push(p[i]);
          }
        }

        this.poiIndices = indices;
        this.poiIndexed = indexed;
        this.poiShown = shown;
      },
      (error:any, caught) => {
        console.log(error);
        return caught;
      });
  }

  ngAfterViewInit() {
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }

  getPoiLabel(i) {
    return (this.poiShown[i] ? '&lsaquo; ' : '&rsaquo; ') + this.poiIndices[i];
  }

  togglePoiShown(i) {
    this.poiShown[i] = !this.poiShown[i];
  }
}
