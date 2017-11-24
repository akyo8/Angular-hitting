import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { environment } from '../environment';
import { AuthService } from '../auth/auth.service';
import { PropertyService } from '../property/property.service';
import * as moment from 'moment/moment';

@Injectable()
export class ContractService {
  authService: AuthService;
  propertyService: PropertyService;
  contract: any;

  constructor(private _http: Http, authService: AuthService,
    propertyService: PropertyService) {
    console.log("Init contract service!");
    this.authService = authService;
    this.propertyService = propertyService;
    this.contract = {};
  }

  importPropertyData() {
    let property = this.propertyService.getCurrentProperty();

    // Address
    this.contract.address = property.address.line1;
    this.contract.city = property.address.city;
    this.contract.state = property.address.countrySubd;
    this.contract.zipcode = property.address.postal1;
    this.contract.offerType = 'hold';
    this.contract.offerAmountType = 'opening';

    if ("undefined" !== typeof this.propertyService.propertyFlipData) {
      this.contract.buyFlipOffer = ('opening' === this.contract.offerAmountType) ?
          this.propertyService.propertyFlipData.startingBid :
          this.propertyService.propertyFlipData.maxBid;
    }

    if ("undefined" !== typeof this.propertyService.propertyRentData) {
      this.contract.buyHoldOffer = ('opening' === this.contract.offerAmountType) ?
          this.propertyService.propertyRentData.startingBid :
          this.propertyService.propertyRentData.maxBid;
    }

    this.chooseBuyHoldOfferType();
  }

  importUserData() {
  }

  chooseBuyHoldOfferType() {
    if (("undefined" !== typeof this.propertyService.propertyRentData) &&
        ("undefined" !== typeof this.propertyService.propertyRent) &&
        ("undefined" !== typeof this.propertyService.propertyRent.purchaseClosingCost)) {
      this.contract.buyHoldOffer = ('opening' === this.contract.offerAmountType) ?
          this.propertyService.propertyRentData.startingBid :
          this.propertyService.propertyRentData.maxBid;
      this.contract.offerPrice = this.contract.buyHoldOffer;
      this.contract.loanDownPaymentFraction =
          ('cash' === this.propertyService.propertyRent.purchaseClosingCost.selected) ?
          this.propertyService.propertyRent.purchaseClosingCost.cash.loanDownPaymentFraction
          : this.propertyService.propertyRent.purchaseClosingCost.financed.loanDownPaymentFraction;
    } else {
      this.contract.buyHoldOffer = 0;
      this.contract.loanDownPaymentFraction = 0;
    }
  }

  chooseBuyFlipOfferType() {
    if (("undefined" !== typeof this.propertyService.propertyFlipData) &&
        ("undefined" !== typeof this.propertyService.propertyFlip) &&
        ("undefined" !== typeof this.propertyService.propertyFlip.purchaseClosingCost)) {
      this.contract.buyFlipOffer = ('opening' === this.contract.offerAmountType) ?
          this.propertyService.propertyFlipData.startingBid :
          this.propertyService.propertyFlipData.maxBid;
      this.contract.offerPrice = this.contract.buyFlipOffer;
      this.contract.loanDownPaymentFraction =
          ('cash' === this.propertyService.propertyFlip.purchaseClosingCost.selected) ?
          this.propertyService.propertyFlip.purchaseClosingCost.cash.loanDownPaymentFraction
          : this.propertyService.propertyFlip.purchaseClosingCost.financed.loanDownPaymentFraction;
    } else {
      this.contract.buyFlipOffer = 0;
      this.contract.loanDownPaymentFraction = 0;
    }
  }
}
