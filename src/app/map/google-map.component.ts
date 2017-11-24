import { Component, Input, Output, OnInit, OnDestroy, ComponentFactoryResolver, Injector, ReflectiveInjector, ViewContainerRef, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { GoogleInfoboxCompComponent } from './google-infobox-comp.component';
import { GoogleLabelCompComponent } from './google-label-comp.component';
import { ShrinkType } from '../property/property-slideout.component';

declare let google: any;

export interface GoogleMapProperty {
    latitude: string|number;
    longitude: string|number;
    label?: string;
}

@Component({
  moduleId: module.id,
  selector: 'app-google-map',
  template: '<div class="map"></div><template #placeholder></template>',
  styleUrls: ['google-map.component.css']
})
export class GoogleMapComponent implements OnInit, OnDestroy {
  @ViewChild('placeholder', {read: ViewContainerRef}) viewContainerRef;

  private _active: boolean;
  private _property: any;
  private _subjectProperty: any;
  private _properties: Array<any>;
  private _altProperties: Array<any>;
  private _showAlt: any;
  private _selected: Array<string>;
  private _shrink: ShrinkType;
  private initialized: boolean;
  private initQueued: boolean;
  private resetEvent: any;
  @Input()
  set property(property: any) {
    this._property = property;
    if (this._active && !this.initQueued) {
      this.initQueued = true;
      this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
    }
  };
  @Input()
  set subjectProperty(property: any) {
    this._subjectProperty = property;
    if (this._active && !this.initQueued) {
      this.initQueued = true;
      this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
    }
  };
  @Input()
  set properties(properties: Array<any>) {
    this._properties = properties;
    if (this._active && !this.initQueued) {
      this.initQueued = true;
      this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
    }
  };
  @Input()
  set altProperties(altProperties: Array<any>) {
    this._altProperties = altProperties;
    if (this._active && !this.initQueued) {
      this.initQueued = true;
      this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
    }
  }
  @Input()
  set altToggle(altToggle: any) {
    console.log('we have altToggle = ' + altToggle);
    this._showAlt = altToggle;
    this._showAlt.toggle = () => {
      this.toggleAltProperties();
    }
  }
  @Input()
  set selected(selected: Array<string>) {
    this._selected = selected;
    if (this._active && !this.initQueued) {
      this.initQueued = true;
      this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
    }
  };
  @Input()
  set shrink(shrink: ShrinkType) {
    if (shrink.size !== this._shrink.size) {
      this._shrink = shrink;
      if (this.mapElement) {
        let center = this.map.getCenter();
        if (0 !== this._shrink.size) {
          switch (this._shrink.dir) {
            case "left":
              this.mapElement.css({"margin-left": this._shrink.size});
              break;
            case "right":
              this.mapElement.css({"margin-right": this._shrink.size});
              break;
          }
        } else {
          this.mapElement.css({"margin-left": 0, "margin-right": 0});
        }
        google.maps.event.trigger(this.map, "resize");
        this.map.setCenter(center);
      }
    } else {
      this._shrink = shrink;
    }
  };
  @Input()
  set active(active: boolean) {
    this._active = active;
    console.log("Active", this._active, "initialized", this.initialized);
    if (this._active && !this.initQueued) {
      this.initQueued = true;
      this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
    }
  }
  @Input()
  set compmeta(meta: any) {
    if (meta && meta.compsFilterUsed) {
      if (meta.compsFilterUsed.proximityInMiles) {
        this.highlightedOuterRadius = meta.compsFilterUsed.proximityInMiles * 1609; // input in miles -> store in meters
        console.log("Setting google map outer subject radius to " + this.highlightedOuterRadius + " meters");
//        if (meta.compsFilterUsed.zipCodeType) {
//            switch (meta.compsFilterUsed.zipCodeType) {
//                case "rural":
//                case "urban":
//                case "suburban":
//                default:
//                  break;
//            }
//        } else {
          this.highlightedInnerRadius = 805;
//        }

        return;
      }
    }

    this.highlightedOuterRadius = 0;
    this.highlightedInnerRadius = 0;
  }
  @Input()
  set mapMode(mode: string) {
    this.mapModeId = mode;
  }
  @Output() public select: EventEmitter<any> = new EventEmitter<any>();
  infobox: any;
  label: any;
  infoboxes: Array<any>;
  labels: Array<any>;
  private injector: Injector;
  private element: ElementRef;
  private mapElement: any;
  private map: any;
  private callback: Function;
  private center: any;
  private marker: any;
  private showAlt: boolean = true;
  private subjectMarker: any;
  private markers: Array<any>;
  private markerOverlay: any;
  private markerOuterRadius: any;
  private markerInnerRadius: any;
  private highlightedInnerRadius: number = 0;
  private highlightedOuterRadius: number = 0;
  private mapModeId: string = "roadmap";
  private redCircleSymbol = {
    path: 'M -12, 0 A 12, 12, 0, 1, 1, 12, 0 A 12, 12, 0, 0, 1, -12, 0',
//    path: 'M 0, 12 A 12, 12, 0, 1, 1, 24, 12 A 12, 12, 0, 0, 1, 0, 12',
    fillColor: 'red',
    fillOpacity: 0.8,
    scale: 1,
    strokeColor: 'white',
    strokeWeight: 5,
    optimized: false
  };
  private smallGrayCircleSymbol = {
    path: 'M -6, 0 A 6, 6, 0, 1, 1, 6, 0 A 6, 6, 0, 0, 1, -6, 0',
    fillColor: 'gray',
    fillOpacity: 0.8,
    scale: 1,
    strokeColor: 'white',
    strokeWeight: 2,
    optimized: false
  };
  private circleSymbols: any = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    injector: Injector,
    element: ElementRef) {
    this.element = element;
    this.initialized = false;
    this.initQueued = false;
    this.resetEvent = null;
    this._property = null;
    this._subjectProperty = null;
    this._properties = [];
    this._altProperties = [];
    this._selected = [];
    this._shrink = {
      dir: "left",
      size: 0
    };
  }

  ngOnInit() {
    if (this._active && !this.initialized) {
      this.initMap();
    }
  }

  initUpdateMap() {
    this.initQueued = false;
    clearTimeout(this.resetEvent);
    this.resetEvent = null;
    if (!this.initialized) {
      this.initMap();
    } else {
      this.updateProperty();
      this.updateProperties();
    }
  }

  initMap() {
    let self = this;
    let bounds: any;
    this.initialized = true;
    this.infobox = null;
    this.infoboxes = [];
    this.labels = [];

    if (this._properties.length) {
        console.log("Init google map, we have ", this._properties.length, " properties, mapMode=" + this.mapModeId);
    } else {
        console.log("Init google map, no properties, mapMode=" + this.mapModeId);
    }

    console.log("We have", this._property, this._subjectProperty);

    if (this._properties && this._properties.length) {
      for (let x=0; x<this._properties.length; x++) {
        this.infoboxes.push(null);
        this.labels.push(null);
      }
    }
    if (this._altProperties) {
      for (let x = 0; x < this._altProperties.length; x++) {
        this.infoboxes.push(null);
      }
    }

    this.center = this.getLLFromProperty(this._property);
    let mapOptions = {
        "center": this.center,
        "scrollWheel": false,
        "zoom": this.mapModeId == 'sat' ? 20 : 16,
        "mapTypeId": this.mapModeId == 'sat' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
        "mapTypeControl": true,
        "mapTypeControlOptions": {style: google.maps.MapTypeControlStyle.DEFAULT},
        "zoomControl": true,
        "zoomControlOptions": {style: google.maps.ZoomControlStyle.SMALL},
        "panControl": true,
        "streetViewControl": false
    };

    this.mapElement = $(this.element.nativeElement)["find"](".map");
    this.map = new google.maps.Map(this.mapElement.get(0), mapOptions);
    this.markerOverlay = new google.maps.OverlayView();
    this.markerOverlay.draw = function() {
      $(this.getPanes().markerLayer)['addClass']('markerLayer');
    };
    this.markerOverlay.setMap(this.map);
    console.log("Initial property LL", this.center);
    this.marker = new google.maps.Marker({
        position: this.center,
        map: this.map,
        icon: this.redCircleSymbol
    });
    this.markerOuterRadius = new google.maps.Circle({
      map: this.map,
      radius: this.highlightedOuterRadius, // radius is in meters
      strokeWeight: .6,
      fillColor: '#AAAAAA',
      fillOpacity: 0.6
    });
    this.markerInnerRadius = new google.maps.Circle({
      map: this.map,
      radius: this.highlightedInnerRadius,
      strokeWeight: .5,
      fillColor: '#AAAAAA',
      fillOpacity: 0.0
    });
    this.markerOuterRadius.bindTo('center', this.marker, 'position');
    this.markerInnerRadius.bindTo('center', this.marker, 'position');

    for (let radiusIncrement = this.highlightedInnerRadius * 2; radiusIncrement < this.highlightedOuterRadius; radiusIncrement += this.highlightedInnerRadius) {
      new google.maps.Circle({
        map: this.map,
        radius: radiusIncrement,
        strokeWeight: .5,
        fillColor: '#AAAAAA',
        fillOpacity: 0.0
      }).bindTo('center', this.marker, 'position');
    }

    if (this._subjectProperty &&
        this._subjectProperty.latitude &&
        this._subjectProperty.longitude) {
        let loc = this.getLLFromProperty(this._subjectProperty);
        let symbol = {};
        symbol = Object.assign(symbol, this.redCircleSymbol);
        symbol["fillColor"] = "green";

        this.subjectMarker = new google.maps.Marker({
            position: loc,
            map: this.map,
            icon: symbol
        });
        bounds = new google.maps.LatLngBounds();
        bounds.extend(this.center);
        bounds.extend(loc);
        this.map.fitBounds(bounds);
    }

    this.callback = function(e) {
      console.log("Marker clicked!", this, e);
      self.markerClick(this, e);
    };
    
    google.maps.event.addListener(this.marker, "click", this.callback);
    this.showLabel(null);

    if (this._properties && this._properties.length) {
      this.markers = [];
      bounds = new google.maps.LatLngBounds();
      bounds.extend(this.center);
      let positions = [];

      for (let index=0; index<this._properties.length; index++) {
        let pos = this.getLLFromProperty(this._properties[index]);
        let marker = new google.maps.Marker({
            position: pos,
            map: this.map,
            icon: this.getMapIcon(this._properties[index])
        });
        google.maps.event.addListener(marker, "click", this.callback);
        this.markers.push(marker);
        this.showLabel(index);
        bounds.extend(pos);
        positions.push(pos);
      }

      if (this.showAlt && this._altProperties && this._altProperties.length) {
        for (let index = 0; index < this._altProperties.length; index++) {
          let pos = this.getLLFromProperty(this._altProperties[index]);

          if (positions.findIndex(existing => pos.equals(existing)) >= 0) {
            continue;
          }

          let marker = new google.maps.Marker({
              position: pos,
              map: this.map,
              icon: this.smallGrayCircleSymbol
          });
          google.maps.event.addListener(marker, "click", this.callback);
          this.markers.push(marker);
          bounds.extend(pos);
        }
      }

      this.map.fitBounds(bounds);
    }
  }

  updateProperty() {
    if (this._property) {
      this.center = this.getLLFromProperty(this._property);
      if (this.marker) {
        this.marker.setPosition(this.center);
        this.map.setCenter(this.center);
      } else {
        this.marker = new google.maps.Marker({
            position: this.center,
            map: this.map,
            icon: this.redCircleSymbol
        });
      }
      if (this._subjectProperty &&
          this._subjectProperty.latitude &&
          this._subjectProperty.longitude) {
        let loc = this.getLLFromProperty(this._subjectProperty);
        if (this.subjectMarker) {
          this.subjectMarker.setPosition(loc);
        } else {
          let symbol = {};
          symbol = Object.assign(symbol, this.redCircleSymbol);
          symbol["fillColor"] = "green";

          this.subjectMarker = new google.maps.Marker({
              position: loc,
              map: this.map,
              icon: symbol
          });
        }
        let bounds = new google.maps.LatLngBounds();
        bounds.extend(this.center);
        bounds.extend(loc);
        this.map.fitBounds(bounds);
      }
    } else if (this.marker) {
      this.marker.setMap(null);
      google.maps.event.clearInstanceListeners(this.marker);
      this.marker = null;
      if (this.subjectMarker) {
        this.subjectMarker.setMap(null);
        this.subjectMarker = null;
      }
    }
  }

  updateProperties() {
    let bounds: any;
    let marker: any;

    if (this.markers && (this.markers.length > 0)) {
      for (marker of this.markers) {
        if ("undefined" !== typeof marker.setMap) {
          marker.setMap(null);
          google.maps.event.clearInstanceListeners(marker);
        } else {
          console.log('cannot unset map for Marker!');
        }
      }
    }
    this.markers = [];
    if (this._properties && this._properties.length) {
      bounds = new google.maps.LatLngBounds();
      bounds.extend(this.center);
      let positions = [];

      for (let index=0; index<this._properties.length; index++) {
        let pos = this.getLLFromProperty(this._properties[index]);
        let marker = new google.maps.Marker({
            position: pos,
            map: this.map,
            icon: this.getMapIcon(this._properties[index])
        });
        google.maps.event.addListener(marker, "click", this.callback);
        this.markers.push(marker);
        this.showLabel(index);
        bounds.extend(pos);
        positions.push(pos);
      }

      if (this.showAlt && this._altProperties && this._altProperties.length) {
        for (let index = 0; index < this._altProperties.length; index++) {
          let pos = this.getLLFromProperty(this._altProperties[index]);

          if (positions.findIndex(existing => pos.equals(existing)) >= 0) {
            continue;
          }

          let marker = new google.maps.Marker({
              position: pos,
              map: this.map,
              icon: this.smallGrayCircleSymbol
          });
          google.maps.event.addListener(marker, "click", this.callback);
          this.markers.push(marker);
          bounds.extend(pos);
        }
      }

      this.map.fitBounds(bounds);
    }
  }

  getMapIcon(property: any) {
    let color = "green";
    let symbol = {};

    if ("undefined" !== typeof property.hitMergedResponse) {
        property = property.hitMergedResponse;
    }

    if (("undefined" !== typeof property.mls) &&
        (null !== property.mls)) {
        switch (property.mls.status) {
          case "Leased":
          case "Sold":
            color = "black";
            break;
        }
    } else {
      color = "black";
    }
    if (-1 !== this._selected.indexOf(property.identifier.bippoId)) {
      color = "#55FF55";
    }
    if ("undefined" === typeof this.circleSymbols[color]) {
      symbol = Object.assign(symbol, this.redCircleSymbol);
      symbol["fillColor"] = color;
      this.circleSymbols[color] = symbol;
    }
    return this.circleSymbols[color];
  }

  getLLFromProperty(property: any) {
    let center: any;

    if ("undefined" !== typeof property.hitMergedResponse) {
        property = property.hitMergedResponse;
    }

    if ("undefined" !== typeof property.latitude) {
        center = new google.maps.LatLng(
            ("string" === typeof property.latitude) ? parseFloat(<string>property.latitude) : <number>property.latitude,
            ("string" === typeof property.longitude) ? parseFloat(<string>property.longitude) : <number>property.longitude
        );
    } else if (("undefined" !== typeof property.location) &&
        (null !== property.location) &&
        ("undefined" !== typeof property.location.latitude) &&
        (null !== property.location.latitude)) {
        center = new google.maps.LatLng(
            ("string" === typeof property.location.latitude) ? parseFloat(<string>property.location.latitude) : <number>property.location.latitude,
            ("string" === typeof property.location.longitude) ? parseFloat(<string>property.location.longitude) : <number>property.location.longitude
        );
    }

    return center;
  }

  markerClick(marker, event) {
    if (this.marker === marker) {
      this.openInfobox(null);
    } else {
      for (let x=0; x<this.markers.length; x++) {
        if (this.markers[x] === marker) {
          this.openInfobox(x);

          if (x < this._properties.length) {
            this.select.emit(this._properties[x]);
          } else {
            let altIndex = x - this._properties.length;

            if (this._altProperties && altIndex < this._altProperties.length) {
              this.select.emit(this._altProperties[altIndex]);
            }
          }

          break;
        }
      }
    }
  }

  showLabel(index: number) {
    if (null === index) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(GoogleLabelCompComponent);
      /*
      let injector = ReflectiveInjector.resolveAndCreate([
        { provide: "property", useValue: this._property },
        { provide: "map", useValue: this.map },
        { provide: "marker", useValue: this.marker }
      ], this.injector);
      this.label = this.viewContainerRef.createComponent(factory, -1, injector);
      */
      this.label = this.viewContainerRef.createComponent(factory);
      this.label.instance.initLabel(this._property, this.map, this.marker);
      this.label.instance.open();
    } else {
      const factory = this.componentFactoryResolver.resolveComponentFactory(GoogleLabelCompComponent);
      /*
      let injector = ReflectiveInjector.resolveAndCreate([
        { provide: "property", useValue: this._properties[index] },
        { provide: "map", useValue: this.map },
        { provide: "marker", useValue: this.markers[index] }
      ], this.injector);
      this.labels[index] = this.viewContainerRef.createComponent(factory, -1, injector);
      */
      this.labels[index] = this.viewContainerRef.createComponent(factory);
      this.labels[index].instance.initLabel(this._properties[index], this.map, this.markers[index]);
      this.labels[index].instance.open();
    }
  }

  openInfobox(index: number) {
    // Clear any open infoboxes
    if (this.infobox) {
        this.infobox.instance.close();
    }

    for (let x=0; x<this._properties.length; x++) {
        if (this.infoboxes[x]) {
            this.infoboxes[x].instance.close();
        }
    }
    if (this._altProperties) {
        let offset = this._properties.length;

        for (let x = 0; x < this._altProperties.length; x++) {
            if (this.infoboxes[x + offset]) {
                this.infoboxes[x + offset].instance.close();
            }
        }
    }

    if (null === index) {
      if (null === this.infobox) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(GoogleInfoboxCompComponent);
        /*
        let injector = ReflectiveInjector.resolveAndCreate([
          { provide: "property", useValue: this._property },
          { provide: "map", useValue: this.map },
          { provide: "marker", useValue: this.marker }
        ], this.injector);
        this.infobox = this.viewContainerRef.createComponent(factory, -1, injector);
        */
        this.infobox = this.viewContainerRef.createComponent(factory);
        this.infobox.instance.initInfobox(this._property, this.map, this.marker);
      }
      this.infobox.instance.open();
    } else {
      if (null === this.infoboxes[index]) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(GoogleInfoboxCompComponent);
        /*
        let injector = ReflectiveInjector.resolveAndCreate([
          { provide: "property", useValue: this._properties[index] },
          { provide: "map", useValue: this.map },
          { provide: "marker", useValue: this.markers[index] }
        ], this.injector);
        this.infoboxes[index] = this.viewContainerRef.createComponent(factory, -1, injector);
        */
        this.infoboxes[index] = this.viewContainerRef.createComponent(factory);

        if (index < this._properties.length) {
          this.infoboxes[index].instance.initInfobox(this._properties[index], this.map, this.markers[index]);
        } else {
          this.infoboxes[index].instance.initInfobox(this._altProperties[index - this._properties.length], this.map, this.markers[index]);
        }
      }

      this.infoboxes[index].instance.open();
    }
  }

  toggleAltProperties() {
    this.showAlt = !this.showAlt;
    this.initQueued = true;
    this.resetEvent = setTimeout(() => this.initUpdateMap(), 10);
  }

  ngOnDestroy() {
    let marker: any;
    if (this.initQueued) {
      this.initQueued = false;
    }
    if (this.resetEvent) {
      clearTimeout(this.resetEvent);
      this.resetEvent = null;
    }
    if (this.marker) {
      this.marker.setMap(null);
      google.maps.event.clearInstanceListeners(this.marker);
      this.marker = null;
    }
    if (("undefined" !== typeof this.markers) && (this.markers.length > 0)) {
      for (marker of this.markers) {
        if ("undefined" !== typeof marker.setMap) {
          marker.setMap(null);
          google.maps.event.clearInstanceListeners(marker);
        }
      }
      this.markers = [];
    }
  }
}
