import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-census',
  templateUrl: 'property-census.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyCensusComponent implements OnInit, AfterViewInit {
  private _property: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }

  propertyService: PropertyService;
  searchService: SearchService;
  censusTab: number;
  private element: ElementRef;
  touchPanes: any;
  census: any = {};
  censusArea: string = "";
  censusAgeChart: any = null;

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this._property = {};
  }

  ngOnInit() {
    this.censusTab = 1;

    let zipcode = this.getProperty().address.postal1;

    this.censusArea = String(zipcode);
    this.propertyService.getCensus(zipcode,
      () => {
        let c = this.propertyService.censusData || {};

        this.census = c;

        let censusAgeData = [
          {
            data: [
              +c.age00_04 + +c.age05_09,
              +c.age10_14 + +c.age15_19,
              +c.age20_24 + +c.age25_29,
              +c.age30_34 + +c.age35_39,
              +c.age40_44 + +c.age45_49,
              +c.age50_54 + +c.age55_59,
              +c.age60_64 + +c.age65_69,
              +c.age70_74 + +c.age75_79,
              +c.age80_84
            ]
          }
        ];

        if (this.censusAgeChart) {
          this.censusAgeChart.data.datasets = censusAgeData;
          this.censusAgeChart.update();
        } else {
          this.censusAgeChart = new (<any>window).Chart(this.element.nativeElement.querySelector('#canvas-census-age'), {
            type: 'bar',
            data: {
              labels: [ '0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+' ],
              datasets: censusAgeData
            },
            options: {
              scaleShowVerticalLines: false,
              responsive: true,
              legend: {
                display: false
              },
              scales: {
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Age'
                  }
                }],
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Population'
                  }
                }]
              }
            }
          });
        }
      },
      (error:any, caught) => {
        console.log(error);
        return caught;
      });
  }

  ngAfterViewInit() {
    /*
    this.touchPanes = jQuery(this.element.nativeElement)["find"](".tabswrapper .panes")["touchPanes"]({
      "change": (tab) => {
        this.censusTab = tab + 1;
      }
    });
    this.touchPanes.init();
    */
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }

  setCensusTab(tab: number) {
    this.censusTab = tab;
  }

  getChildrenPct() {
    let children = Number(this.census.hhdch);
    let nochild = Number(this.census.hhdnch);
    return Math.floor(children * 1000 / (children + nochild)) / 10;
  }
}
