import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../search/search.service';
import { PropertyService } from '../property/property.service';

declare let numeral:any;

@Component({
  moduleId: module.id,
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  searchService: SearchService;
  propertyService: PropertyService;
  pageTitle:string;
  hoveredArticle: any = null;

  constructor(
    private router: Router,
    searchService: SearchService,
    propertyService: PropertyService
  ) {
    console.log("Init dashboard component!");
    this.searchService = searchService;
    this.propertyService = propertyService;
  }

  ngOnInit() {
    this.pageTitle = "Dashboard";
      this.searchService.watchlistPage = 0;
      this.searchService.getFullWatchlistProperties((error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
      this.searchService.getNewProperties((error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
      this.searchService.getAuctionMetadata(3);
  }

  toggleWatchlistSearchListing(id: any) {
    this.searchService.toggleWatchlistSearchListing(id, (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  viewProperty(property: any) {
    this.router.navigate(['/property', this.searchService.getPropertyId(property)]);
  }

  viewAuctionCounty(acm: any) {
    this.router.navigate(['/auction-search', 'county=' + acm.county + '&minTime=' + acm.minTime + '&maxTime=' + acm.maxTime]);
  }

  roundDom(dom) {
    for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
    return '> 365';
  }
}

