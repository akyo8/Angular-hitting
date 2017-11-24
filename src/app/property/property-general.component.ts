import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { NotesService } from './notes.service';
import { SearchService } from '../search/search.service';
import { GoogleStreetviewComponent } from '../map/google-streetview.component';
import * as moment from 'moment/moment';


@Component({
  moduleId: module.id,
  selector: 'app-property-general',
  templateUrl: 'property-general.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyGeneralComponent implements OnInit {
  propertyService: PropertyService;
  searchService: SearchService;
  notesService: NotesService;
  photoCount: number;
  taxTab: number;
  remarksTab: number;
  auctionTab: number;
  curYear: number;
  viewedAccordions: boolean;
  viewedAccordion;

  constructor(propertyService: PropertyService,
        searchService: SearchService,
        notesService: NotesService) {
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.notesService = notesService;
  }

  ngOnInit() {
    this.photoCount = 0;
    this.taxTab = 1;
    this.remarksTab = 1;
    this.auctionTab = 1;
    this.curYear = moment().year();
    this.viewedAccordions = false;
    this.viewedAccordion = -1;
  }

  doChange() {
    // Do nothing, just trigger update cycle; this prevents an issue with
    // clicking on a tab other than general, then clicking back to general.
    return true;
  }

  isMapActive() {
    let prop = this.propertyService.getCurrentProperty();
    return prop && prop.location && prop.location.latitude && prop.location.longitude;
  }

  toggleAccordionViewed(acc) {
/*    if (this.viewedAccordion == acc) {
      this.viewedAccordion = -1;
      this.viewedAccordions = false;
    } else {
      this.viewedAccordion = acc;
      this.viewedAccordions = true;
    }*/
  }

  setTaxTab(tab: number) {
    this.taxTab = tab;
  }

  setRemarksTab(tab: number) {
    this.remarksTab = tab;
  }

  setAuctionTab(tab: number) {
    this.auctionTab = tab;
  }
}
