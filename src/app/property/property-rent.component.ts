import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { ActivatedRoute }  from '@angular/router';
import { BoundingRectClass, IEventSlideAble } from 'ng2-slideable-directive/slideable.directive';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment/moment';

@Component({
  moduleId: module.id,
  selector: 'app-property-rent',
  templateUrl: 'property-rent.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyRentComponent implements OnInit, DoCheck {
  private _active: boolean;
  @Input()
  set active(active: boolean) {
    this._active = active;
    this.viewTab();
  }
  propertyService: PropertyService;
  searchService: SearchService;
  private sub: any;
  private bippoId: string;
  coctab: string = "tab-cash";
  private forceCap: any;

  constructor(private route: ActivatedRoute,
        propertyService: PropertyService,
        searchService: SearchService) {
    this.propertyService = propertyService;
    this.searchService = searchService;
  }

  ngOnInit() {
    this.forceCap = .095;
    this.bippoId = null;
    this.propertyService.getPropertyRentListPriceTypes();
    this.propertyService.getPropertyRentPriceTypes();
    this.sub = this.route.params.subscribe(params => {
      this.bippoId = this.propertyService.parsePropertyId(params['addr']);
    });
  }

  viewTab() {
      if (this._active && this.bippoId) {
          /*
          this.propertyService.getPropertyRentData(this.bippoId, () => {
              this.propertyService.generatePropertyRentDeps();
          }, (error:any, caught: Observable<any>) => {
            console.log(error);
            return caught;
          });
          this.getPropertyRevisions(this.bippoId, 'rent', (error:any, caught: Observable<any>) => {
            console.log(error);
            return caught;
          });
          this.propertyService.generatePropertyRentDeps();
          this.generatePropertyRentDeps();
          */
      }
  }

  selectCoC(tabname: string, purchaseClosingCostSelected: string) {
    this.coctab = tabname;
    this.propertyService.propertyRent.purchaseClosingCost.retainProfit = true;
    this.propertyService.propertyRent.purchaseClosingCost.selected = purchaseClosingCostSelected;
  }

  protected generatePropertyRentDeps() {
    let self = this;
    if (this.propertyService.property && (Object.keys(this.propertyService.property).length > 0)) {
      this.propertyService.generatePropertyRentDeps();
    } else {
      setTimeout(function() {
        self.generatePropertyRentDeps();
      }, 100);
    }
  }

  public revertRevision(revision: any) {
      this.propertyService.revertRevision(revision.id, 'rent', (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
  }

  public handleChangeCapIncome(event: IEventSlideAble) {
    this.propertyService.propertyRent.purchaseClosingCost.retainProfit = false;
    this.propertyService.adjustCapIncomeByPct(event.relativePercentHorisontal);
  }

  public handleFixCapIncomePercent(event: IEventSlideAble) {
    this.propertyService.propertyRent.purchaseClosingCost.retainProfit = false;
    this.propertyService.fixCapIncome();
  }

  public ngDoCheck() {
    this.propertyService.updatePropertyRentTotals();

    if (this.forceCap) {
      let mkt = this.propertyService.propertyRentData.marketPriceSelectedValue;
      let newCap = mkt - this.propertyService.propertyRent.income.net * 12 / this.forceCap;

      if (newCap < 0) {
        newCap = 0;
      } else if (newCap > mkt) {
        newCap = mkt;
      }

      this.propertyService.propertyRent.income.cap = newCap;
      this.propertyService.updatePropertyRentTotals();
      this.propertyService.propertyRent.purchaseClosingCost.retainProfit = false;
      this.propertyService.fixCapIncome();
      this.forceCap = null;
    }
  }

  public formatTime(timeString: string) {
    return moment(new Date(timeString)).format("MMMM Do, YYYY - h:mm a");
  }

  public percentMask(inputString: string) {
    let numericLength = 0;
    let matchArray: Array<string | RegExp> = [];
    matchArray.push(/\d/);
    for (numericLength = 1; numericLength < inputString.length; numericLength++) {
      if (!/\d/.test(String(inputString[numericLength]))) {
        matchArray.push('%');
        return matchArray;
      } else {
        matchArray.push(/\d/);
      }
    }

    matchArray.push('%');
    return matchArray;
  }

  decimalToPercent(value: number) {
    if (value) {
      return value * 100;
    } else {
      return 0;
    }
  }

  decimalPercent(conformedValue: string, config): any {
    let matches = conformedValue.match(/(\d+)\%?/);
    if (matches && (matches.length > 1) && (matches[1].length > 0)) {
      return {value: parseFloat(matches[1]) / 100};
    } else {
      return {value: 0};
    }
  }

  getLoanDownPaymentDollars() {
    return Math.floor(this.propertyService.propertyRent.purchaseClosingCost.financed.loanDownPaymentFraction * this.propertyService.propertyRentData.startingBid);
  }

  selectNextQuality() {
    let quality = this.propertyService.getFlipSelectedQuality();

    if (("undefined" !== typeof quality) && quality > 0 && quality <= 5) {
      this.propertyService.selectQualityScore(quality - 1);
    }
  }

  selectPrevQuality() {
    let quality = this.propertyService.getFlipSelectedQuality();

    if (("undefined" !== typeof quality) && quality >= 0 && quality < 5) {
      this.propertyService.selectQualityScore(quality + 1);
    }
  }

  itemHasCost0(item) {
    switch (item.costType) {
      case 'PER_GLA':
      case 'PER_LOT':
      case 'PIECE_COST':
      case 'PER_GLA_2':
      case 'PER_GLA_PC':
        return true;
      default:
        return false;
    }
  }

  itemHasCost1(item) {
    return item.costType == 'PER_GLA_2';
  }

  itemHasSourceUnit(item) {
    switch (item.costType) {
      case 'PER_GLA':
      case 'PER_LOT':
      case 'PER_GLA_2':
        return true;
      default:
        return false;
    }
  }

  itemHasCount(item) {
    switch (item.costType) {
      case 'PIECE_COST':
      case 'PER_GLA_PC':
        return true;
      default:
        return false;
    }
  }
}
