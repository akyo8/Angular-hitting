import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { ActivatedRoute }  from '@angular/router';
import { BoundingRectClass, IEventSlideAble } from '../plugins/slideable.directive';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment/moment';

@Component({
  moduleId: module.id,
  selector: 'app-property-flip',
  templateUrl: 'property-flip.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyFlipComponent implements OnInit, DoCheck {
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
  private forceRoi: any;

  constructor(private route: ActivatedRoute,
        propertyService: PropertyService,
        searchService: SearchService) {
    this.propertyService = propertyService;
    this.searchService = searchService;
  }

  ngOnInit() {
    this.forceRoi = .1;
    this.bippoId = null;
    this.propertyService.getPropertyFlipListPriceTypes();
    this.sub = this.route.params.subscribe(params => {
      this.bippoId = this.propertyService.parsePropertyId(params['addr']);
      this.viewTab();
    });
  }

  protected viewTab() {
      if (this._active && this.bippoId) {
          /*
          this.propertyService.getPropertyFlipData(this.bippoId, () => {
              this.propertyService.generatePropertyFlipDeps();
          }, (error:any, caught: Observable<any>) => {
            console.log(error);
            return caught;
          });
          this.propertyService.getPropertyRevisions(this.bippoId, 'flip', 0, (error:any, caught: Observable<any>) => {
            console.log(error);
            return caught;
          });
          this.propertyService.generatePropertyFlipDeps();
          this.generatePropertyFlipDeps();
          */
      }
  }

  protected generatePropertyFlipDeps() {
    let self = this;
    if (this.propertyService.property && (Object.keys(this.propertyService.property).length > 0)) {
      this.propertyService.generatePropertyFlipDeps();
    } else {
      setTimeout(function() {
        self.generatePropertyFlipDeps();
      }, 100);
    }
  }

  public revertRevision(revision: any) {
      this.propertyService.revertRevision(revision.id, 'flip', (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
  }

  selectClosingCostType(purchaseClosingCostSelected: string) {
    this.propertyService.propertyFlip.purchaseClosingCost.retainProfit = true;
    this.propertyService.propertyFlip.purchaseClosingCost.selected = purchaseClosingCostSelected;
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

  public handleChangeProfit(event: IEventSlideAble) {
    this.propertyService.adjustProfitByPct(event.relativePercentHorisontal);
  }

  public handleFixProfitPercent(event: IEventSlideAble) {
    this.propertyService.fixProfit();
  }

  public ngDoCheck() {
    this.propertyService.updatePropertyFlipTotals();

    if (this.forceRoi) {
      let newProfit = this.forceRoi * (this.propertyService.propertyFlipData.maxBid + this.propertyService.propertyFlipData.costToFlip);

      if (newProfit < 0) {
        newProfit = 0;
      }

      this.propertyService.propertyFlip.profit = newProfit;
      this.propertyService.updatePropertyFlipTotals();
      this.propertyService.fixProfit();
      this.forceRoi = null;
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
    return Math.floor(this.propertyService.propertyFlip.purchaseClosingCost.financed.loanDownPaymentFraction * this.propertyService.propertyFlipData.startingBid);
  }

  getRealEstateCommDollars() {
    return Math.floor(this.propertyService.propertyFlip.sellingClosingCost.realEstateCommission * this.propertyService.property.market.arv);
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
