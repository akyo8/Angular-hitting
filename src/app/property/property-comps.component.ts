import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute }  from '@angular/router';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import { ShrinkType } from './property-slideout.component';
import { Observable, Subscription } from 'rxjs/Rx';
import * as moment from 'moment/moment';

declare let numeral:any;

@Component({
  moduleId: module.id,
  selector: 'app-property-comps',
  templateUrl: 'property-comps.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyCompsComponent implements OnInit {
  private _active: boolean;
  @Input()
  set active(active: boolean) {
    setTimeout(() => {
      this._active = active;
      this.viewTab();
    });
  }
  @Input() type: string;
  @Output() navigateTo: EventEmitter<string> = new EventEmitter<string>();
  propertyService: PropertyService;
  searchService: SearchService;
  private sub: any;
  private bippoId: string;
  busy: Array<Subscription>;
  propertySummary: string = null;
  mapShrink: ShrinkType;
  altPropertyToggle: any;
  narrShowMore: boolean = false;
  private page: number = 0;
  private columnProperties: any = null;
  private columnPage: any = null;
  private columnStart: number = 0;
  private columnCount: number = 0;
  private columnAdjustments: boolean = true;

  constructor(private router: Router,
        private route: ActivatedRoute,
        propertyService: PropertyService,
        searchService: SearchService) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.busy = [];
    this.mapShrink = {
      dir: "left",
      size: 0
    };
    this.altPropertyToggle = {};
  }

  hasExcludedComps() {
    return this.propertyService.propertyCompsExcluded && this.propertyService.propertyCompsExcluded.length > 0;
  }

  getLastPage() {
    if (this.hasExcludedComps()) {
      return 2;
    }

    return 1;
  }

  ngOnInit() {
    this.bippoId = null;
    this.sub = this.route.params.subscribe(params => {
      this.bippoId = this.propertyService.parsePropertyId(params['addr']);
    });
    this.page = 0;

    this.recacheColumnProperties();
  }

  recacheColumnProperties() {
    this.columnAdjustments = true;

    switch (this.type) {
      case 'wholesale':
        this.columnAdjustments = false;
        // fall-through
      case 'arv':
        this.columnProperties = this.propertyService.propertyCompsSelected;
        break;
      case 'asIs':
        this.columnProperties = this.propertyService.propertyComps;
        break;
      default:
        this.columnProperties = null;
        break;
    }

    if (this.columnProperties) {
      this.columnPage = this.columnProperties.slice(0, 3); // If length is <= 3, this will simply be the whole array
      this.columnCount = this.columnProperties.length;
      this.columnStart = 0;
    } else {
      this.columnPage = null;
      this.columnCount = 0;
      this.columnStart = 0;
    }
  }

  isActive() {
    return this._active;
  }

  viewTab() {
      if (this._active && this.bippoId && ((this.propertyService.propertyCompBippoId !== this.bippoId) || (this.propertyService.propertyCompsType !== this.type))) {
          this.busy = [this.propertyService.getPropertyCompsData(this.bippoId, this.type,
            () => {
              console.log('Got property comps data, recaching indexed data..');
              this.recacheColumnProperties();
            },
            (error:any, caught: Observable<any>) => {
              console.log(error);
              return caught;
            })];
      }
  }

  narrativeShowMore() {
    this.narrShowMore = true;
  }

  narrativeShowLess() {
    this.narrShowMore = false;
  }

  getCompLabel() {
    switch (this.type) {
      case 'arv':
        return "ARV";
      case 'asIs':
        return "MA";
      case 'wholesale':
        return "Wholesale";
      case 'rent':
        return "Rent";
      default:
        return "";
    }
/*    if (("undefined" !== typeof this.propertyService.propertyCompsType) &&
        (null !== this.propertyService.propertyCompsType) &&
        ("" !== this.propertyService.propertyCompsType)) {
        this.propertyService.getPropertyFlipListPriceTypes();
        for (let x of this.propertyService.propertyFlipListPriceTypes) {
          if (this.propertyService.propertyCompsType === x.value) {
            return x.label;
          }
        }
    }
    return "";*/
  }

  getCompTooltip() {
    switch (this.type) {
      case 'arv':
        return "The HIT After-Repair Value (ARV) is the top of the market for a fixed-up property of like kind. Based exclusively on Sold prices it is the upper limit of the subject's best case potential value at the time of the evaluation. Relevant fields are aligned and bracketed including gross living area (GLA), year built, lot size, design/construction quality, pools and other core amenities- including bedrooms and bathrooms and adjusted to the subject using paired analysis standards. Proximity and closed date are the first lines of demercation and we will reach out until we have at least 6 sold properties that align with the subject. ARV is always fixed up to the top of the market so no adjustments are made for quality and condition; we seek the top comps and make amenity adjustments only.";
      case 'asIs':
        return "The HIT Market Average (MA) value is aimed for the middle value or middle price tier for the subject - average condition, generally well-maintained and may have some updates 'as needed' but no major remodel. MA assumes the subject and the comps are in like condition and may have one or more latent defects. MA excludes the properties used in HIT's ARV and brackets all the remaining relevant comps to the subject adjusting GLA, lot size, garage spaces, bedrooms, baths and year built as needed. MA might be described as the day to day value or the value as 'lived in and it shows.'";
      case 'wholesale':
        return "For HIT's Wholesale value, we look up to 3 miles from the subject for REO, short sales and other distressed properties within 25% GLA of the subject. Generally, this is considered the bottom of the market for distress in the past 6 or even as long as 12 months. We sort for flip properties and reach back to the original sale and point that out in the comps used. Minor adjustments are made for GLA, garage, and lot size only. This is the bottom of the market, generally for distressed property in poor condition. If we find an obvious 'flip,' then we cite it and use it as one of the base lines by which a wholesale value is measured for this area for properties of like kind.";
      case 'rent':
        return "With HIT Rents, we look for rents within a one to three mile radius of the subject and adjust for bedrooms and school system and identify trends based on elementary schools. Footage and condition differences are weighted to determine a realistic best case scenario; from this base line we pull out the high and the low rental for properties of like kind in this immediate area.";
      default:
        return "";
    }
  }

  getCompType() {
    let prop = this.propertyService.property;

    if (prop && prop.hitMergedResponse.address && prop.hitMergedResponse.address.zipType) {
      return prop.hitMergedResponse.address.zipType != 'Unknown' ? prop.hitMergedResponse.address.zipType : "";
    }

    return 'Rural';
  }

  getListPrice(property) {
    if (("undefined" !== typeof property.mls) &&
        (null !== property.mls)) {
      return "$" + numeral(property.mls.listPrice).format("0,0");
    } else {
      return "No List";
    }
  }

  toggleWatchlistSearchListing(id: string) {
    this.searchService.toggleWatchlistSearchListing(id, (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  viewProperty(property: any) {
    this.navigateTo.emit('tab-general');
    setTimeout(() => {
      this.router.navigate(['/property', this.propertyService.getPropertyId(property)]);
    });
  }

  togglePropertySummary(id: any) {
    if ("string" !== typeof id) {
      id = this.propertyService.getPropertyId(id);
    }
    if (!this.propertySummary || (this.propertySummary !== <string>id)) {
      this.propertySummary = <string>id;
    } else {
      this.propertySummary = null;
    }
  }

  isPropertySummaryOpen(property: any) {
    return this.propertySummary &&
        (this.propertySummary === this.propertyService.getPropertyId(property));
  }

  setMapShrink(shrink: ShrinkType) {
    this.mapShrink = shrink;
  }

  toggleCompsMapAlt(shrink: ShrinkType) {
    if (this.altPropertyToggle.toggle) {
      this.altPropertyToggle.toggle();
    } else {
      console.log('altPropertyToggle wasn\'t initialized! ' + this.altPropertyToggle);
    }
  }

  roundDom(dom) {
    for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
    return '> 365';
  }

  pricePerFootage(price, footage) {
    return Number(String(price).replace(/\D/g, "")) / Number(String(footage).replace(/\D/g, ""));
  }

  nextPage() {
    this.page++;
  }

  prevPage() {
    this.page--;
  }

  columnPrevPage() {
    if (!this.columnProperties || this.columnStart < 1) {
      return;
    }

    this.columnStart--;
    this.columnPage = this.columnProperties.slice(this.columnStart, this.columnStart + 3);
  }

  columnNextPage() {
    if (!this.columnProperties || this.columnStart + 1 > this.columnCount - 3) {
      return;
    }

    this.columnStart++;
    this.columnPage = this.columnProperties.slice(this.columnStart, this.columnStart + 3);
  }

  inferTotalRooms(d) {
    return d.roomsTotal ? d.roomsTotal : (d.beds + 4);
  }
}
