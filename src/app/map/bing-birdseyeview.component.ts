import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { GoogleMapProperty } from './google-map.component';
import { environment } from '../environment';
import { isBingMapsLoaded } from '../app.module';

declare let Microsoft: any;

@Component({
  moduleId: module.id,
  selector: 'app-bing-birdseyeview',
  template: '<div class="birdseyeview"></div>',
  styleUrls: ['bing-birdseyeview.component.css']
})
export class BingBirdseyeviewComponent implements OnInit {
  private _active: boolean;
  private initialized: boolean;
  @Input() property: GoogleMapProperty;
  @Input() zoom: number;
  @Input()
  set active(active: boolean) {
    this._active = active;
    if (this._active && !this.initialized) {
      this.initBirdseyeview();
    }
  }
  private element: ElementRef;
  private bvElement: any;
  private map: any;
  private marker: any;
  private center: any;

  constructor(element: ElementRef) {
    this.element = element;
    this.initialized = false;
  }

  ngOnInit() {
    if (this._active && !this.initialized) {
      this.initBirdseyeview();
    }
  }

  initBirdseyeview() {
    this.initialized = true;
    if (("undefined" !== typeof Microsoft) && isBingMapsLoaded()) {
      this.center = new Microsoft.Maps.Location(
        ("string" === typeof this.property.latitude) ? parseFloat(<string>this.property.latitude) : <number>this.property.latitude,
        ("string" === typeof this.property.longitude) ? parseFloat(<string>this.property.longitude) : <number>this.property.longitude
      );
      this.bvElement = $(this.element.nativeElement)["find"](".birdseyeview").get(0);

      console.log(Microsoft.Maps.MapTypeId.birdseye);
	  let birdseyeMapOptions = {
        center: this.center,
        zoom: this.zoom || 16
	  };
      this.map = new Microsoft.Maps.Map(this.bvElement, { 
        credentials: environment.BING_KEY,
		mapTypeId: Microsoft.Maps.MapTypeId.aerial,
        showDashboard: false,
        showLocateMeButton: false,
        showMapTypeSelector: false,
        showScalebar: false
      });
      this.map.setView(birdseyeMapOptions);
      this.marker = new Microsoft.Maps.Pushpin(this.center, {
        title: this.property.label
      });
      this.map.entities.push(this.marker);
    } else {
      setTimeout(() => {
        this.initBirdseyeview();
      }, 100);
    }
  }

  ngOnDestroy() {
    // TODO
  }
}
