import { Component, Input, ElementRef } from '@angular/core';
import { PropertyService } from '../property/property.service';
import { SearchService } from '../search/search.service';

declare let google: any;
declare let InfoBox: any;

@Component({
  moduleId: module.id,
  selector: 'app-google-infobox',
  templateUrl: 'google-infobox-comp.component.html',
  styleUrls: ['google-map.component.css']
})
export class GoogleInfoboxCompComponent {
  propertyService: PropertyService;
  searchService: SearchService;
  //@Input() property: any;
  //@Input() map: any;
  //@Input() marker: any;
  property: any;
  map: any;
  marker: any;
  private element: ElementRef;
  private infobox: any;
  private closeListener: any = null;

  constructor(propertyService: PropertyService,
    searchService: SearchService,
    element: ElementRef) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.element = element;
    this.property = {};
  }

  initInfobox(property: any, map: any, marker: any) {
    this.property = property;
    this.map = map;
    this.marker = marker;

    console.log(this.element.nativeElement);
    this.infobox = new InfoBox({
      boxClass: "infoBox open",
      alignBottom: true,
      alignPctLeft: 50,
      pixelOffset: new google.maps.Size(13, -10),
      content: this.element.nativeElement,
      position: this.marker.getPosition(),
      visible: true
    });
  }

  open() {
    this.infobox.open(this.map, this.marker);
    this.closeListener = google.maps.event.addListener(this.infobox, "closeclick", this.close.bind(this));
    console.log(this.closeListener);
  }

  close() {
    $(this.element.nativeElement)['closest'](".infoBox")['removeClass']("open");
    google.maps.event.removeListener(this.closeListener);
  }

  ngOnDestroy() {
    // TODO
  }

  roundDom(dom) {
    for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
    return '> 365';
  }
}
