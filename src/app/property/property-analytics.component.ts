import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-analytics',
  templateUrl: 'property-analytics.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyAnalyticsComponent implements OnInit, AfterViewInit {
  private _property: any;
  @Input()
  set property(property: any) {
    this._property = property;
  }

  propertyService: PropertyService;
  searchService: SearchService;
  private element: ElementRef;
  graphPrices: any = null;
  graphCounts: any = null;
  analyticsChart: any = null;

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this._property = {};
  }

  ngOnInit() {
    this.propertyService.getAnalytics(this.getProperty().address.postal1,
      () => {
        this.graphPrices = this.propertyService.analyticsData.priceDataPoints;
        this.graphCounts = this.propertyService.analyticsData.countDataPoints;

        let analyticsChartData = {
          labels: this.propertyService.analyticsData.dataPointLabels,
          datasets: [
            {
              label: "Median Sale Price",
              backgroundColor: ["rgba(51, 102, 153, 0.2)"],
              borderColor: ["rgba(51, 102, 153, 1)"],
              borderWidth: 1,
              yAxisID: "left-y-axis",
              data: this.graphPrices
            },
            {
              label: "Sales Volume",
              backgroundColor: ["rgba(102, 102, 153, 0.2)"],
              borderColor: ["rgba(102, 102, 153, 1)"],
              borderWidth: 1,
              yAxisID: "right-y-axis",
              data: this.graphCounts
            }
          ]
        };

        if (this.analyticsChart) {
          this.analyticsChart.data = analyticsChartData;
          this.analyticsChart.update();
        } else {
          this.analyticsChart = new (<any>window).Chart(this.element.nativeElement.querySelector('#canvas-analytics'), {
            type: 'line',
            data: analyticsChartData,
            options: {
              scaleShowVerticalLines: false,
              responsive: true,
              scales: {
                yAxes: [
                  {
                    "position": "left",
                    "id": "left-y-axis"
                  },
                  {
                    "position": "right",
                    "id": "right-y-axis"
                  }
                ]
              }
            }
          });
        }
      },
      (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
  }

  ngAfterViewInit() {
  }

  getProperty(valueset: string = undefined) {
    return this.propertyService.getPropertyData(this._property, valueset);
  }
}
