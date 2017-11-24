import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { GoogleMapProperty } from './google-map.component';

declare let google: any;

@Component({
  moduleId: module.id,
  selector: 'app-google-streetview',
  template: '<div class="streetview"></div>',
  styleUrls: ['google-streetview.component.css']
})
export class GoogleStreetviewComponent implements OnInit {
  private _active: boolean;
  private _property: any;
  private initialized: boolean;
  @Input()
  set property(property: any) {
    this._property = property;
    console.log("Setting streetview property", property);

    if (this._active) {
      this.initStreetview();
    }
  }
  @Input() radius: number;
  @Input()
  set active(active: boolean) {
    this._active = active;
    if (this._active && !this.initialized) {
      this.initStreetview();
    }
  }
  private element: ElementRef;
  private streetviewElement: any;
  private panorama: any;
  private svService: any;
  private position: any;
  private failed: boolean;

  constructor(element: ElementRef) {
    this.element = element;
    this.initialized = false;
    if (!this.radius) {
      // 100 meter radius
      this.radius = 100;
    }
    this.failed = false;
  }

  ngOnInit() {
    if (this._active && !this.initialized) {
      this.initStreetview();
    }
  }

  initStreetview() {
    this.initialized = true;
    this.failed = false;
    console.log("Init streetview with property", this._property);
    this.position = new google.maps.LatLng(
        ("string" === typeof this._property.latitude) ? parseFloat(<string>this._property.latitude) : <number>this._property.latitude,
        ("string" === typeof this._property.longitude) ? parseFloat(<string>this._property.longitude) : <number>this._property.longitude
    );
    this.streetviewElement = $(this.element.nativeElement)["find"](".streetview");
    this.svService = new google.maps.StreetViewService();

    let disableControls = ("undefined" !== typeof this._property.noControls) && this._property.noControls;

    this.panorama = new google.maps.StreetViewPanorama(this.streetviewElement.get(0), {
      streetViewControl: !disableControls,
      disableDefaultUI: disableControls
    });
    this.svService.getPanorama({
      location: this.position,
      radius: this.radius
    }, (data: any, status: string) => this.processPanorama(data, status));
  }

  processPanorama(data: any, status: string) {
    if ("OK" == status) {
      this.panorama.setPano(data['location']['pano']);
      this.panorama.setPov({
        heading: this.calculateHeading(data) || 270,
        pitch: 0
      });
      this.panorama.setVisible(true);
      this.failed = false;
    } else {
      console.error("Street view data not available for this location; searching at " + this.position + " within " + this.radius + " meters. Error Code [" + status + "] " + data);
      this.failed = true;
    }
  }

  calculateHeading(data: any) {
    let center = data.location.latLng;

    if ('undefined' !== typeof (center)) {
      return (google.maps.geometry.spherical.computeHeading(center, this.position));
    }
    return false;
  }

  hasFailed() {
    return this.failed;
  }

  ngOnDestroy() {
    // TODO
  }
}
