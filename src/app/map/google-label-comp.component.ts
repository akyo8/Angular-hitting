import { Component, Input, ElementRef } from '@angular/core';

declare let google: any;
declare let InfoBox: any;
declare let numeral:any;

@Component({
  moduleId: module.id,
  selector: 'app-google-infobox',
  templateUrl: 'google-label-comp.component.html',
  styleUrls: ['google-map.component.css']
})
export class GoogleLabelCompComponent {
  //@Input() property: any;
  //@Input() map: any;
  //@Input() marker: any;
  property: any;
  map: any;
  marker: any;
  private element: ElementRef;
  private infobox: any;
  private closeListener: any = null;

  constructor(element: ElementRef) {
    this.element = element;
    this.property = {};
  }

  initLabel(property: any, map: any, marker: any) {
    this.property = property;
    if ("undefined" !== typeof property["hitMergedResponse"]) {
        this.property = property["hitMergedResponse"];
    }
    this.map = map;
    this.marker = marker;

    this.infobox = new InfoBox({
      boxClass: "infoLabel",
      alignPctLeft: 70,
      pixelOffset: new google.maps.Size(13, 13),
      content: this.element.nativeElement,
      position: this.marker.getPosition(),
      closeBoxURL: "",
      visible: true
    });
  }

  open() {
    if (this.infobox && (typeof this.infobox.open === "function")) {
      this.infobox.open(this.map, this.marker);
    }
  }

  getListPrice() {
    if (("undefined" !== typeof this.property.mls) &&
        (null !== this.property.mls)) {
      return "$" + numeral(this.property.mls.listPrice).format("0,0");
    } else {
      return "No List";
    }
  }

  isPositiveChange() {
    if (("undefined" !== typeof this.property.comp) &&
        (null !== this.property.comp) &&
        ("undefined" !== typeof this.property.comp.change) &&
        (null !== this.property.comp.change) &&
        (this.property.comp.change.length > 0)) {
          return ("-" !== this.property.comp.change.substr(0, 1));
    } else {
      return false;
    }
  }

  isNegativeChange() {
    if (("undefined" !== typeof this.property.comp) &&
        (null !== this.property.comp) &&
        ("undefined" !== typeof this.property.comp.change) &&
        (null !== this.property.comp.change) &&
        (this.property.comp.change.length > 0)) {
          return ("-" === this.property.comp.change.substr(0, 1));
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    // TODO
  }
}
