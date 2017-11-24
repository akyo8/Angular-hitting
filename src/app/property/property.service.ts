import { Injectable, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { AuthService } from '../auth/auth.service';
import { environment } from '../environment';
import * as moment from 'moment/moment';

declare let numeral:any;
declare let NinjaSlider:any;
declare let ThumbnailSlider:any;

@Injectable()
export class PropertyService {
  authService: AuthService;
  property: any;
  propertyCommon: any;
  propertyFlip: any;
  propertyFlipMeta: any;
  propertyFlipData: any;
  propertyFlipRevisions: Array<any>;
  propertyFlipListPriceTypes: Array<any>;
  propertyRentListPriceTypes: Array<any>;
  propertyRentPriceTypes: Array<any>;
  propertyFlooringScaling: any;
  propertyRent: any;
  propertyRentMeta: any;
  propertyRentData: any;
  propertyRentRevisions: Array<any>;
  propertyComps: Array<any>;
  propertyCompBippoId: string;
  propertyCompsSelected: Array<any>;
  propertyCompsBackground: Array<any>;
  propertyCompsExcluded: Array<any>;
  propertyCompsSelectedList: Array<string>;
  propertyBippoId: string;
  propertyCompSubjectValues: any;
  propertyCompsValues: any;
  propertyCompsMeta: any;
  propertyCompsType: string;
  areaPropertyGroups: Array<any>;
  censusData: any = {};
  poiData: Array<any> = [];
  analyticsData: any;
  propertyViews: Array<string>;
  propertyDesigns: Array<string>;
  propertyQualities: Array<string>;
  propertyConditions: Array<string>;
  page: number;
  size: number;
  syncRepairData: boolean = true;
  ninjaSliderBaseOptions: any = {
    transitionType: "fade", //"fade", "slide", "zoom", "kenburns 1.2" or "none"
    autoAdvance: false, //If autoAdvance is required, don't set this to true. You can set the autoAdvance of the Thumbnail Slider to true because the "before" callback function listed below has been set to let this slider to be driven by the Thumbnail Slider.
    delay: "default",
    transitionSpeed: 400,
    aspectRatio: "2:1",
    initSliderByCallingInitFunc: false,
    shuffle: false,
    startSlideIndex: 0, //0-based
    navigateByTap: true,
    keyboardNav: true,
    license: "b2o481"
  };
  thumbnailSliderBaseOptions: any = {
    orientation: "horizontal",
    thumbWidth: "auto",
    thumbHeight: "50px",
    showMode: 3,
    autoAdvance: false,
    selectable: true,
    slideInterval: 3000,
    transitionSpeed: 700,
    shuffle: false,
    startSlideIndex: 0, //0-based
    pauseOnHover: true,
    initSliderByCallingInitFunc: false,
    rightGap: null,
    keyboardNav: false,
    mousewheelNav: true,
    license: "b2o481"
  };
  ngZone: NgZone;

  constructor(private _http: Http, ngZone: NgZone, authService: AuthService) {
    console.log("Init property service!");
    this.ngZone = ngZone;
    this.authService = authService;
    this.propertyFlipListPriceTypes = [];
    this.propertyRentListPriceTypes = [];
    this.propertyRentPriceTypes = [];
    this.propertyFlooringScaling = {
      'carpet': 0.8,
      'hard': 0.2
    };
    this.property = null;
    this.propertyCommon = {
      //marketPriceOtherValue: 200000 // customer entered, preserved on back end
      market: {}
    };
    this.propertyFlip = {
      market: {},
      profit: 0,
      purchaseClosingCost: {
        cash: {
        },
        financed: {
        }
      },
      repairAndRemodel: {
        repairsByQuality: [
          {
            quality: 1,
            stories: 1,
            items: []
          },
          {
            quality: 2,
            stories: 1,
            items: []
          },
          {
            quality: 3,
            stories: 1,
            items: []
          },
          {
            quality: 4,
            stories: 1,
            items: []
          },
          {
            quality: 5,
            stories: 1,
            items: []
          },
          {
            quality: 6,
            stories: 1,
            items: []
          }
        ],
        defaultQuality: 3,
        selectedQuality: 3,
        selectedRepairs: []
      },
      expensesMonths: 3,
      expensesMonthsOptions: [3],
      expenses: {
        utilityCosts: {
        }
      },
      sellingClosingCost: {
      }
    };
    this.propertyFlipData = {
        absROIFormatted: "",
        ROIFormatted: "",
        roi: 0,
        repairAndRemodel: {
            exterior: {
              paintOptions: [],
              windowOptions: [],
              roofOptions: []
            },
            interior: {
              paintOptions: [],
              interiorDoorOptions: [],
              carpetedSurfaceOptions: [],
              hardFloorSurfaceOptions: [],
              lightFixtureOptions: [],
              kitchenAppliancesSelected: []
            },
            mechanicalSystems: {
              hvacOptions: []
            }
        },
        expensesMonthsOptions: [],
        expenses: {
            insurance: 0,
            realEstateTaxes: 0,
            mowing: 0,
            utilityCosts: {
              waterAndSewer: 0,
              electrical: 0,
              gas: 0,
              alarm: 0,
              other: 0
            },
            hoa: 0,
            poolService: 0,
            other: 0
        }
    };

    this.propertyFlipRevisions = [
      {
        "author": "Chris Manning",
        "time": "2016-4-4 14:37:00",
        "revisions": [
          {'model': 'market.selected', 'value': 'arv'},
          {'model': 'purchaseClosingCost.titlePolicy', 'value': [500, 0]},
          {'model': 'purchaseClosingCost.insurance', 'value': [0, 300]},
        ]
      },
      {
        "author": "Chris Manning",
        "time": "2016-4-4 14:13:00",
        "revisions": [
          {'model': 'purchaseClosingCost.titlePolicy', 'value': [250, 250]},
        ]
      }
    ];
    this.propertyRent = {
      market: {},
      purchaseClosingCost: {
        cash: {
        },
        financed: {
        }
      },
      rent: {
        options: [],
        rentOptions: []
      },
      expenses: {
        hoa: {
          hoaOptions: [],
          cost: 0
        },
        mortgage: {},
        loan: {
          termOptions: [],
          interestRatePercent: 0
        },
        other: 0
      },
      income: {
        net: 0,
        cap: 0,
        capPercent: 0
      },
      repairs: {
        interiorPaint: {},
        carpet: {},
        hardFloorSurfaces: {},
        systemAverageFair: {},
        systemFair: {},
        systemFairPoor: {},
        systemPoor: {}
      }
    };
    /*
    this.propertyRent = {
      listPrice: 185000,
      marketPriceSelected: 'arv',
      marketPriceOtherValue: 200000, // customer entered, preserved on back end
      marketPrice: {
        arv: 195000
      },
      rentPriceSelected: 'renta',
      rentPrice: {
        renta: 1200,
        rentb: 1800
      },
      rentPriceOtherValue: 0,
      expenses: {
        realEstateTaxes: 0,
        insurance: 0,
        vacancyRatePercent: 0.05,
        maintenancePercent: 0,
        managementPercent: 0,
        mortgageSelected: 'other',
        mortgageOtherValue: 0,
        loanTermSelected: 30,
        loanTermOptions: [3, 5, 10, 15, 20, 25, 30],
        interestRatePercent: 0.05,
        hoa: 0,
        other: 0
      },
      purchaseClosingCostSelected: 'cash',
      purchaseClosingCost: {
        cash: {
          titlePolicy: 500,
          titleCompanyFees: 450,
          titleCompanyEscrowFees: 50,
          hoa: 500,
          insurance: 0,
          realEstateTaxes: 0,
          survey: 0,
          loanOrigination: 0,
          transferTax: 0,
          loanDownPaymentPercent: 0
        },
        financed: {
          titlePolicy: 0,
          titleCompanyFees: 0,
          titleCompanyEscrowFees: 0,
          hoa: 0,
          insurance: 300,
          realEstateTaxes: 0,
          survey: 200,
          loanOrigination: 1000,
          transferTax: 0,
          loanDownPaymentPercent: 0.2
        }
      },
      netIncome: 0,
      capIncome: 0,
      cap: 0,
      repairs: {
        interiorPaint: {
          value: 0,
          locked: false,
          included: false
        },
        exteriorPaint: {
          value: 0,
          locked: false,
          included: false
        },
        carpet: {
          value: 0,
          locked: false,
          included: false
        },
        hardFloorSurfaces: {
          value: 0,
          locked: false,
          included: false
        },
        systemaveragefair: {
          value: 0,
          per: 500,
          included: false
        },
        systemfair: {
          value: 0,
          per: 1000,
          included: false
        },
        systemfairpoor: {
          value: 0,
          per: 2500,
          included: false
        },
        systempoor: {
          value: 0,
          per: 7500,
          included: false
        }
      }
    };
    */
    this.propertyRentData = {
        rentPriceSelectedValue: 1200,
        maxBid: 165000,
        startingBid: 125000,
        loanDownPayment: 0,
        expensesSubtotal: 0,
        expensesTotal: 0,
        expenses: {
          vacancyRate: 0,
          maintenance: 0,
          management: 0,
          realEstateTaxesOptions: [{'label': 'Other', 'value': 0}],
          insuranceOptions: [{'label': 'Other', 'value': 0}],
          maintenanceOptions: [{'label': 'Other', 'value': 0}],
          managementOptions: [{'label': 'Other', 'value': 0}],
          hoaOptions: [{'label': 'Other', 'value': 0}],
          mortgageOptions: [
              {'label': 'Precalculated', value: 'precalculated'},
              {'label': 'Entered', 'value': 'other'}
          ],
          mortgageSelectedValue: 0,
          loanTermOptions: []
        },
        annualProfit: 0,
        absAnnualProfit: 0,
        absCapFormatted: "",
        capFormatted: "",
        NOIFormatted: "",
        absBaseCapFormatted: "",
        noi: 0,
        purchaseClosingCostSubtotal: 0,
        purchaseClosingCostTotal: 0,
        repairTotal: 0,
        repairs: {
          interiorPaint: 0,
          exteriorPaint: 0,
          carpet: 0,
          hardFloorSurfaces: 0,
          systemAverageFair: 0,
          systemFair: 0,
          systemFairPoor: 0,
          systemPoor: 0
        }
    };
    this.propertyRentRevisions = [
      {
        "author": "Chris Manning",
        "time": "2016-4-4 14:37:00",
        "revisions": [
          {'model': 'marketPriceSelected', 'value': 'arv'},
          {'model': 'purchaseClosingCost.titlePolicy', 'value': [500, 0]},
          {'model': 'purchaseClosingCost.insurance', 'value': [0, 300]},
        ]
      },
      {
        "author": "Chris Manning",
        "time": "2016-4-4 14:13:00",
        "revisions": [
          {'model': 'purchaseClosingCost.titlePolicy', 'value': [250, 250]},
        ]
      }
    ];
    this.resetPropertyCompsSearch();
    this.propertyBippoId = null;
    this.areaPropertyGroups = [];
    this.size = 20;
    this.page = 0;
  }

  parsePropertyId(idString: string) {
    let addr = decodeURIComponent(idString).split("-", 2);
    let parsedAddr = [];
    for (let x of addr) {
      let splitAddr = x.split(":");
      splitAddr[0] = String(splitAddr[0]).toLowerCase();
      if (-1 !== ['obpropid', 'mlsnumber', 'as'].indexOf(String(splitAddr[0]))) {
        parsedAddr.push(x);
      }
    }
    return parsedAddr.join("-");
  }

  getCurrentProperty(valueset: string = undefined) {
    return this.getPropertyData(this.property, valueset);
  }

  getProperty(id, successHandler, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'property/' +
        encodeURIComponent(id), {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          this.property = data;
          this.areaPropertyGroups = [];
          console.log("Setting property", this.property);

          if ("undefined" === typeof data.market) {
            if (("undefined" !== typeof data.hitMergedResponse) && ("undefined" !== typeof data.hitMergedResponse.comps)) {
              data.market = {
                arv: 0,
                asIs: 0,
                wholesale: 0,
                rent: 0,
                rentLow: 0,
                rentHigh: 0,
                rentAverage: 0
              };

              let compValues = data.hitMergedResponse.comps;

              if (compValues.arv) {
                data.market.arv = compValues.arv;
              }
              if (compValues.asIs) {
                data.market.asIs = compValues.asIs;
              }
              if (compValues.wholesale) {
                data.market.wholesale = compValues.wholesale;
              }
              if (compValues.rentHigh) {
                data.market.rentHigh = compValues.rentHigh;
              }
              if (compValues.rentLow) {
                data.market.rentLow = compValues.rentLow;
              }
              if (compValues.rentAverage) {
                data.market.rentAverage = compValues.rentAverage;
              }
            } else {
              data.market = data.hitMergedResponse.market;
            }
          }

          // Adapt footage: If MLS footage is present, and sourced as appraiser, use it as the default footage for this property
          // Otherwise, the default will be left as the footage given by tax (which is already in the data as the default)
          if (data.hitMergedResponse && data.hitMergedResponse.building && data.hitMergedResponse.building.size) {
            data.hitMergedResponse.building.size.bldgSizeSource = 'Tax'

            if (data.mls && data.mls.mls && data.mls.mls.footageSource) {
              if (data.mls.mls.footageSource == 'Appraiser' && data.mls.building && data.mls.building.size && data.mls.building.size.bldgSize && +data.mls.building.size.bldgSize > 0) {
                data.hitMergedResponse.building.size.bldgSize = data.mls.building.size.bldgSize;
                data.hitMergedResponse.building.size.bldgSizeSource = 'Appraiser';
              }
            }
          }

          // Ugly - handles race conditions in setting default values based on property data. Make a proper system for this in the future
          if (this.propertyFlip) {
            if (this.propertyFlip.purchaseClosingCost && this.propertyFlip.purchaseClosingCost.financed) {
              this.propertyFlip.purchaseClosingCost.financed.taxEscrowMonths = 2;
              this.propertyFlip.purchaseClosingCost.financed.taxEscrow = Math.floor(this.getTaxAmt() / 6);
            }

            if (this.propertyFlip.expenses) {
              this.propertyFlip.expenses.realEstateTaxes = Math.floor(this.getTaxAmt() / 4);
            }

            if (this.propertyFlip.sellingClosingCost) {
              this.propertyFlip.sellingClosingCost.titlePolicy = Math.floor(data.hitMergedResponse.mls ? data.hitMergedResponse.mls.listPrice * 0.01 : 0);
            }

            if (this.isRepairAndRemodelSetup(this.propertyFlip.repairAndRemodel) || this.isRepairAndRemodelSetup(this.propertyRent.repairs)) {
              if (this.isRepairAndRemodelSetup(this.propertyFlip.repairAndRemodel)) {
                this.recalcFlipRepairCosts(data.hitMergedResponse, true);
              }

              if (this.isRepairAndRemodelSetup(this.propertyRent.repairs)) {
                this.recalcRentRepairCosts(data.hitMergedResponse, true);
              }
            }

            this.updatePropertyExpenseMonthlyTotals();
          }

          if (this.propertyRent) {
            if (this.propertyRent.expenses) {
              this.propertyRent.expenses.realEstateTaxes = Math.floor(this.getTaxAmt() / 12);
            }
          }

          if (successHandler) {
            successHandler();
          }
        },
        error => errorHandler,
        () => console.log(this.property)
      );
  }

  getPropertyTaxAssessValue(field: string, year: number, property: any = undefined) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if (property) {
        if (("undefined" !== typeof property["hitMergedResponse"]) &&
            property["hitMergedResponse"]) {
            property = property["hitMergedResponse"];
        }
        if (("undefined" !== typeof property.assessment) &&
            (null !== property.assessment) &&
            ("undefined" !== typeof property.assessment.assessed) &&
            (null !== property.assessment.assessed) &&
            ("undefined" !== typeof property.assessment.assessed[field]) &&
            (null !== property.assessment.assessed[field])) {
            return (year === property.assessment.tax.taxYear) ? property.assessment.assessed[field] : 0;
        }
    }
    return 0;
  }

  getStatus(searchService, property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
          property.mls &&
          ("undefined" !== typeof property.mls.status) &&
          property.mls.status) {
          searchService.getSearchMetadata((error:any, caught: Observable<any>) => {
            console.log(error);
            return caught;
          });
          for (let status of searchService.mlsStatuses) {
            if (status.value === property.mls.status) {
              return status.label;
            }
          }
        }
    }
    return null;
  }

  getStatusAbbr(searchService, property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
          property.mls &&
          ("undefined" !== typeof property.mls.status) &&
          property.mls.status) {
          searchService.getSearchMetadata((error:any, caught: Observable<any>) => {
            console.log(error);
            return caught;
          });
          for (let status of searchService.mlsStatuses) {
            if (status.value === property.mls.status) {
              return status.retsShortValue;
            }
          }
        }
    }
    return null;
  }

  getStatusChangeDate(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
          property.mls &&
          ("undefined" !== typeof property.mls.statusChangeTimestampFrom) &&
          (null !== property.mls.statusChangeTimestampFrom)) {
          return moment(property.mls.statusChangeTimestampFrom).toDate();
        }
    }
    return null;
  }

  getPropertyHousingType(property: any, valueset: string = undefined) {
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property && ("undefined" !== typeof property[valueset]) &&
        property[valueset]) {
        property = property[valueset];
    }
    if (property &&
        ("undefined" !== typeof property.summary) &&
        property.summary &&
        ("undefined" !== typeof property.summary.propClass) &&
        property.summary.propClass) {
        let housing = property.summary.propClass.split(" / ");
        return housing[0];
    }
    return "";
  }

  getPropertyHousingStyle(property: any, valueset: string = undefined) {
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property && ("undefined" !== typeof property[valueset]) &&
        property[valueset]) {
        property = property[valueset];
    }
    if (property &&
        ("undefined" !== typeof property.summary) &&
        property.summary &&
        ("undefined" !== typeof property.summary.propClass) &&
        property.summary.propClass) {
        let housing = property.summary.propClass.split(" / ");
        return housing[1];
    }
    return "";
  }

  getPropertyId(property: any = undefined) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    property = this.getPropertyData(property);
    if (("undefined" !== typeof property.identifier) &&
      property.identifier &&
      ("undefined" !== typeof property.identifier.bippoId) &&
      property.identifier.bippoId) {
      return property.identifier.bippoId;
    }
    return null;
  }

  getPropertyData(property: any, valueset: string = undefined) {
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }

    if (property && ("undefined" !== typeof property[valueset]) && property[valueset]) {
        return property[valueset];
    } else if (property) {
        if (valueset != "hitMergedResponse" && ("undefined" !== typeof property["hitMergedResponse"]) && property["hitMergedResponse"]) {
            return property["hitMergedResponse"];
        }

        return property;
    } else {
        return {};
    }
  }

  getCompProperty(id: string, valueset: string = undefined, returnValueset: boolean = true) {
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (("undefined" !== typeof id) && id) {
      let property: any;
      for (property of this.propertyComps) {
        let p = property;
        if (property) {
            if (("undefined" !== typeof property[valueset]) &&
                property[valueset]) {
                p = property[valueset];
            }
            if (("undefined" !== typeof p["identifier"]) &&
                p["identifier"] &&
                ("undefined" !== typeof p["identifier"]["bippoId"]) &&
                p["identifier"]["bippoId"] &&
                (id === p["identifier"]["bippoId"])) {
                return returnValueset ? p : property;
            }
        }
      }
    }
    return {};
  }

  getExcludedCompProperty(id: string, valueset: string = undefined, returnValueset: boolean = true) {
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (("undefined" !== typeof id) && id) {
      let property: any;
      for (property of this.propertyCompsExcluded) {
        let p = property;
        if (property) {
            if (("undefined" !== typeof property[valueset]) &&
                property[valueset]) {
                p = property[valueset];
            }
            if (("undefined" !== typeof p["identifier"]) &&
                p["identifier"] &&
                ("undefined" !== typeof p["identifier"]["bippoId"]) &&
                p["identifier"]["bippoId"] &&
                (id === p["identifier"]["bippoId"])) {
                return returnValueset ? p : property;
            }
        }
      }
    }
    return {};
  }

  getCompPropertyDistance(id: string, valueset: string) {
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (("undefined" !== typeof id) && id) {
      for (let property of this.propertyComps) {
        if (property) {
            let tmp = property;
            if (("undefined" !== typeof property[valueset]) &&
                property[valueset]) {
                tmp = property[valueset];
            }
            if (("undefined" !== typeof tmp["identifier"]) &&
                tmp["identifier"] &&
                ("undefined" !== typeof tmp["identifier"]["bippoId"]) &&
                tmp["identifier"]["bippoId"] &&
                (id === tmp["identifier"]["bippoId"])) {
                return property.distance;
            }
        }
      }
    }
    return 0;
  }

  getListPrice(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
            (null !== property.mls)) {
          return numeral(property.mls.listPrice).format("0,0");
        } else {
          return "No List";
        }
    }
  }

  getOriginalListPrice(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
            (null !== property.mls)) {
          return numeral(property.mls.originalListPrice).format("0,0");
        } else {
          return "No List";
        }
    }
  }

  getClosePrice(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
            (null !== property.mls)) {
          return numeral(property.mls.closePrice).format("0,0");
        } else {
          return "";
        }
    }
  }

  hasListPrice(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        return (("undefined" !== typeof property.mls) &&
            (null !== property.mls));
    } else {
        return false;
    }
  }

  hasClosePrice(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        return (("undefined" !== typeof property.mls) &&
            (null !== property.mls)) && (("undefined" !== typeof property.mls.closePrice) && (property.mls.closePrice > 0));
    } else {
        return false;
    }
  }

  getPricePerSQFT(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if ("string" === typeof property) {
      property = this.propertyCompsValues[property];
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.mls) &&
            (null !== property.mls) &&
            ("undefined" !== typeof property.building) &&
            (null !== property.building) &&
            ("undefined" !== typeof property.building.size) &&
            (null !== property.building.size) &&
            (0 !== property.building.size.bldgSize)) {
          return numeral(property.mls.listPrice / property.building.size.bldgSize).format("0,0.00");
        } else {
          return 0;
        }
    } else {
      return 0;
    }
  }

  getGarageSpaces(property, valueset) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.building) &&
          (null !== property.building) &&
          ("undefined" !== typeof property.building.parking) &&
          (null !== property.building.parking)) {
          return Math.floor(property.building.parking.prkgSize / 180);
        } else {
          return 0;
        }
    } else {
        return 0;
    }
  }

  getTaxAmt(property = undefined, valueset = undefined) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property) {
        if (("undefined" !== typeof property[valueset]) &&
            property[valueset]) {
            property = property[valueset];
        }
        if (("undefined" !== typeof property.assessment) &&
            (null !== property.assessment) &&
            ("undefined" !== typeof property.assessment.tax) &&
            (null !== property.assessment.tax)) {
            return property.assessment.tax.taxAmt;
        }
    }
    return null;
  }

  getPropertyFlipListPriceTypes() {
    this.propertyFlipListPriceTypes = [
      {'label': 'ARV', 'value': 'arv'},
      {'label': 'AS - IS', 'value': 'asIs'},
//      {'label': 'Wholesale', 'value': 'wholesale'},
      {'label': 'Other', 'value': 'other'}
    ];
  }

  getPropertyRentListPriceTypes() {
    this.propertyRentListPriceTypes = [
      {'label': 'ARV', 'value': 'arv'},
      {'label': 'AS - IS', 'value': 'asIs'},
      {'label': 'Other', 'value': 'other'}
    ];
  }

  getPropertyRentPriceTypes() {
    this.propertyRentPriceTypes = [
      {'label': 'Rent A', 'value': 'renta'},
      {'label': 'Rent B', 'value': 'rentb'},
      {'label': 'Rent Other', 'value': 'other'}
    ];
  }

  getPropertyFlooringScaling() {
    this.propertyFlooringScaling = {
      'carpet': 0.8,
      'hard': 0.2
    };
  }

  copyToCommon(type) {
    let x: string;
    type = type.substr(0, 1).toUpperCase() + type.substr(1);
    for (x of ['market', 'marketPriceSelectedValue']) {
      if ((("undefined" === typeof this.propertyCommon[x]) ||
        (("market" === x) &&
        ("undefined" === typeof this.propertyCommon[x].type))) &&
        ("undefined" !== typeof this['property' + type][x])) {
        this.propertyCommon[x] = this['property' + type][x];
      }
    }
  }

  isRepairAndRemodelSetup(rr) {
    return ("undefined" !== typeof rr.defaultQuality) && rr.repairsByQuality;
  }

  setupRepairAndRemodel(rr) {
    if ("undefined" === typeof rr.defaultQuality) {
      rr.defaultQuality = 3; // Q4, ordinal 3
    }

    rr.selectedQuality = rr.defaultQuality;
    rr.selectedRepairs = [];
    rr.noRepairs = false;

    for (let repairSet of rr.repairsByQuality) {
      for (let i = 0; i < repairSet.items.length; i++) {
        let repairItem = repairSet.items[i];
        repairItem.included = false;
        repairItem.cost = 0;
        repairItem.index = i;

        if (repairItem.labelSource && !repairItem.labelIntermediary) {
          repairItem.labelIntermediary = repairItem.labelSource;
        }

        this.attachLabelTooltip(repairItem);
      }
    }
  }

  getPropertyFlipData(id, callbackHandler, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'property/' +
        encodeURIComponent(id) + '/flip', {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          let property = this.getCurrentProperty();
          this.propertyFlip = data["userSelectedFlipParameters"];

          if ("undefined" === typeof this.propertyFlip.purchaseClosingCost.buyerPays) {
            this.propertyFlip.purchaseClosingCost.buyerPays = false;
          }

          if ("undefined" === typeof this.propertyFlip.purchaseClosingCost.resaleCertificate) {
            this.propertyFlip.purchaseClosingCost.resaleCertificate = false;
          }

          if ("undefined" === typeof this.propertyFlip.profit) {
            if (("undefined" !== typeof property.mls) && property.mls) {
              this.propertyFlip.profit = Math.round((property.mls.listPrice * 0.05) / 100) * 100;
            } else {
              this.propertyFlip.profit = 5000;
            }
          }

          this.setupRepairAndRemodel(this.propertyFlip.repairAndRemodel);
          this.recacheRepairs(property);
          this.recalcFlipRepairCosts(property, true);

          this.propertyFlip.purchaseClosingCost.cash.titlePolicy = Math.round(this.propertyFlip.purchaseClosingCost.cash.titlePolicy);
          this.propertyFlip.purchaseClosingCost.financed.titlePolicy = Math.round(this.propertyFlip.purchaseClosingCost.financed.titlePolicy);
          this.propertyFlip.purchaseClosingCost.financed.loanOrigination = Math.round(this.propertyFlip.purchaseClosingCost.financed.loanOrigination);
          this.propertyFlip.purchaseClosingCost.financed.loanDownPaymentFraction = 0.1;
          this.propertyFlip.purchaseClosingCost.financed.taxEscrowMonths = 2;
          this.propertyFlip.purchaseClosingCost.financed.taxEscrow = Math.floor(this.getTaxAmt() / 6);
          this.propertyFlip.expenses.hoa = Math.round(this.propertyFlip.expenses.hoa);
          this.propertyFlip.expenses.insurance = 50; // Temporary - pending insurance user settings
          this.propertyFlip.expenses.realEstateTaxes = Math.floor(this.getTaxAmt() / 4);
          this.propertyFlipData.expenses.financing = 0;
          this.propertyFlip.expenses.financing = 0;
          this.propertyFlip.sellingClosingCost.realEstateCommission = 0.045;
          this.propertyFlip.sellingClosingCost.titlePolicy = Math.floor(property && property.mls ? property.mls.listPrice * 0.01 : 0);
          this.propertyFlip.sellingClosingCost.titleCompanyFees = 450.0;

          this.propertyFlipMeta = data;
          delete this.propertyFlipMeta.userSelectedFlipParameters;
          this.copyToCommon('flip');
          console.log("Setting propertyFlip", this.propertyFlip);
          this.generatePropertyFlipDeps();
          callbackHandler();
        },
        error => errorHandler,
        () => console.log(this.propertyFlip)
      );
  }

  recalcFlipRepairCosts(property: any, reindex: boolean) {
    this.recalcRepairCosts(property, reindex, this.propertyFlip.repairAndRemodel);
  }

  recalcRentRepairCosts(property: any, reindex: boolean) {
    this.recalcRepairCosts(property, reindex, this.propertyRent.repairs);
  }

  recalcRepairCosts(property: any, reindex: boolean, rr: any) {
    if (rr.selectedRepairs) {
      for (let repairItem of rr.selectedRepairs) {
        switch (repairItem.costType) {
          case 'PER_GLA':
            repairItem.cost = Math.floor(repairItem.costBase0 * repairItem.sourceUnit);
            break;
          case 'PER_GLA_2':
            repairItem.cost = Math.floor((repairItem.costBase0 + repairItem.costBase1) * repairItem.sourceUnit);
            break;
          case 'PER_LOT':
            repairItem.cost = Math.floor(repairItem.costBase0 * repairItem.sourceUnit);
            break;
          case 'FIXED_COST':
            repairItem.cost = Math.floor(repairItem.costBase0);
            break;
          case 'PIECE_COST':
            repairItem.cost = Math.floor(repairItem.costBase0 * repairItem.count);
            break;
        }
      }
    }

    if (!reindex) {
      return;
    }

    let gla = 0;
    let lot = 0;

    if (property) {
      if (property.building && property.building.size && property.building.size.bldgSize) {
        gla = property.building.size.bldgSize;
      }

      if (property.lot && property.lot.lotSizeInSQFT) {
        lot = property.lot.lotSizeInSQFT;
      }
    }

    for (let repairSet of rr.repairsByQuality) {
      for (let repairItem of repairSet.items) {
        switch (repairItem.costType) {
          case 'PER_GLA':
            repairItem.cost = Math.floor(repairItem.costBase0 * gla * repairItem.sourceMultiplier);
            break;
          case 'PER_GLA_2':
            repairItem.cost = Math.floor((repairItem.costBase0 + repairItem.costBase1) * gla * repairItem.sourceMultiplier);
            break;
          case 'PER_LOT':
            repairItem.cost = Math.floor(repairItem.costBase0 * lot * repairItem.sourceMultiplier);
            break;
          case 'FIXED_COST':
            repairItem.cost = Math.floor(repairItem.costBase0);
            break;
          case 'PIECE_COST':
            repairItem.cost = Math.floor(repairItem.costBase0 * repairItem.count);
            break;
        }
      }
    }
  }

  cleanAndRecalcFlipRepairs() {
    for (let item of this.propertyFlip.repairAndRemodel.selectedRepairs) {
      for (let f of ['sourceUnit', 'costBase0', 'costBase1']) {
        if ("undefined" !== typeof item[f]) {
          item[f] = +item[f];

          if (!item[f]) {
            item[f] = 0;
          }
        }
      }
    }

    this.recalcFlipRepairCosts(this.getCurrentProperty(), false);
  }

  cleanAndRecalcRentRepairs() {
    for (let item of this.propertyRent.repairs.selectedRepairs) {
      for (let f of ['sourceUnit', 'costBase0', 'costBase1']) {
        if ("undefined" !== typeof item[f]) {
          item[f] = +item[f];

          if (!item[f]) {
            item[f] = 0;
          }
        }
      }
    }

    this.recalcRentRepairCosts(this.getCurrentProperty(), false);
  }

  recacheRepairs(property) {
    let gla = 0;
    let lot = 0;

    if (property) {
      if (property.building && property.building.size && property.building.size.bldgSize) {
        gla = property.building.size.bldgSize;
      }

      if (property.lot && property.lot.lotSizeInSQFT) {
        lot = property.lot.lotSizeInSQFT;
      }
    }

    this.recacheRepairs0(this.propertyFlip.repairAndRemodel, gla, lot);
    this.recacheRepairs0(this.propertyRent.repairs, gla, lot);
  }

  recacheRepairs0(rr, gla, lot) {
    let former = rr.selectedRepairs;
    rr.selectedRepairs = [];

    if (("undefined" !== typeof rr.selectedQuality) && rr.repairsByQuality) {
      let repairs = rr.repairsByQuality[rr.selectedQuality];

      for (let i = 0; i < repairs.items.length; i++) {
        let item = repairs.items[i];
        let copiedItem = Object.assign({}, item);

        if (former && i < former.length) {
          copiedItem.included = former[i].included;
        }

        copiedItem.cost = 0;

        switch (copiedItem.costType) {
          case 'PER_GLA':
          case 'PER_GLA_2':
            copiedItem.sourceUnit = Math.floor(gla * copiedItem.sourceMultiplier);
            break;
          case 'PER_LOT':
            copiedItem.sourceUnit = Math.floor(lot * copiedItem.sourceMultiplier);
            break;
          case 'FIXED_COST':
          case 'PIECE_COST':
            copiedItem.sourceUnit = 0;
            break;
        }

        rr.selectedRepairs.push(copiedItem);
      }
    }
  }

  selectQualityScore(quality) {
    // TODO: Refactor the two selectedQuality fields into a single field somewhere not on one of the objects
    this.propertyFlip.repairAndRemodel.selectedQuality = quality;
    this.propertyRent.repairs.selectedQuality = quality;

    let property = this.getCurrentProperty();

    this.recacheRepairs(property);
    this.recalcFlipRepairCosts(property, false);
    this.recalcRentRepairCosts(property, false);
  }

  getFlipDefaultQuality() {
    let q = this.propertyFlip.repairAndRemodel.defaultQuality;

    return ("undefined" === typeof q) ? -1 : q;
  }

  getRentDefaultQuality() {
    let q = this.propertyRent.repairs.defaultQuality;

    return ("undefined" === typeof q) ? -1 : q;
  }

  getFlipSelectedQuality() {
    let q = this.propertyFlip.repairAndRemodel.selectedQuality;

    return ("undefined" === typeof q) ? -1 : q;
  }

  getRentSelectedQuality() {
    let q = this.propertyRent.repairs.selectedQuality;

    return ("undefined" === typeof q) ? -1 : q;
  }

  attachLabelTooltip(item) {
    if (item.labelName) {
      switch (item.labelName) {
        case 'Landscaping':
          item.labelTooltip = 'Landscape expense is rarely taken into consideration because it covers a vast number of possibilities. Dead trees, shrubs that have reached the end of their service life, weed infested lawns and planting areas are a few of the possible expenses that are too difficult to forecast. HIT sets these as defaults with the understanding that the Member will change them to suit the circumstances. These suggestions assume that the property is in average condition and needs some enhancements to improve the drive up appeal of the property on resale. It is optional in all cases but not to be ignored if the Member wants to consider landscaping in the Cost to cure for flip or hold.';
          break;
      }
    }
  }

  getQualityName(q) {
    if ("undefined" === typeof q) {
      return '-';
    } else switch (q) {
      case 0:
        return 'Estate';
      case 1:
        return 'Custom';
      case 2:
        return 'Semi Custom';
      case 3:
        return 'Production';
      case 4:
        return 'Economy';
      case 5:
        return 'Basic';
      default:
        return '-';
    }
  }

  getQualityDescription(q, stories) {
    if (!stories) {
      stories = 1;
    }

    if ("undefined" == typeof q) {
      return '';
    } else switch (q) {
      case 0:
        return '<b>Q1-' + stories + '</b>: <b>Estate</b><br>-Unique, individually designed<br>- Exceptionally high level workmanship<br>- Exceptionally high grade materials<br>- Exceptionally high quality refinements';
      case 1:
        return '<b>Q2-' + stories + '</b>: <b>Custom</b><br>- Custom designed<br>- High quality tract developments<br>- High quality materials<br>- High quality refinements';
      case 2:
        return '<b>Q3-' + stories + '</b>: <b>Semi Custom</b><br>- Readily available plans<br>- Above standard residental tracts<br>- Workmanship exceeds standards<br>- Materials and finishes upgraded from stock';
      case 3:
        return '<b>Q4-' + stories + '</b>: <b>Production</b><br>- Meet or exceed building codes<br>- Standard or modified plans<br>- Adequate fenestration<br>- Stock/builder grade finish & equipment';
      case 4:
        return '<b>Q5-' + stories + '</b>: <b>Economy</b><br>- Economy of construction<br>- Basic functionality<br>- Plain design, basic floor plans<br>- Inexpensive, stock materials';
      case 5:
        return '<b>Q6-' + stories + '</b>: <b>Basic</b><br>- Basic quality, lower cost<br>- Simple or no plans<br>- Lowest quality materials<br>- Systems/equipment minimal or non-existent';
      default:
        return '';
    }
  }

  getFlipRepairsCondition() {
    return this.getRepairsCondition(this.propertyFlip.repairAndRemodel);
  }

  getRentRepairsCondition() {
    return this.getRepairsCondition(this.propertyRent.repairs);
  }

  getRepairsCondition(rr) {
    let repairs = null;

    if (rr.selectedRepairs) {
      repairs = rr.selectedRepairs;
    } else if (("undefined" !== rr.selectedQuality) && rr.repairsByQuality) {
      repairs = rr.repairsByQuality[rr.selectedQuality].items;
    }

    if (repairs) {
      let systems = 0;
      let cosmetics = 0;

      for (let item of repairs) {
        if (item.included) {
          switch (item.itemType) {
            case 'COSMETIC':
              cosmetics++;
              break;
            case 'SYSTEM':
              systems++;
              break;
          }
        }
      }

      if (systems > 1) {
        return 5;
      } else if (systems > 0) {
        return 4;
      } else if (cosmetics > 3) {
        return 3;
      } else if (cosmetics > 1) {
        return 2;
      } else if (cosmetics > 0) {
        return 1;
      } else if (rr.noRepairs > 0) {
        return 0;
      } else {
        return -1;
      }
    } else {
      return -1;
    }
  }

  getRepairConditionName(index) {
    switch (index) {
      case 0:
        return 'Excellent';
      case 1:
        return 'Good';
      case 2:
        return 'Above Avg';
      case 3:
        return 'Average';
      case 4:
        return 'Fair';
      case 5:
        return 'Poor';
      default:
        return '-';
    }
  }

  getRepairConditionDescription(c) {
    if ("undefined" == typeof c) {
    } else switch (c) {
      case 0:
        return '<b>C1</b>: <b>Excellent</b><br>- Recently constructed<br>- Not previously occupied<br>- Structure/components are new<br>- No physical depreciation';
      case 1:
        return '<b>C2</b>: <b>Good</b><br>- No deferred maintenance<br>- Little/no depreciation, no repairs needed<br>- Updated to current standards<br>- Almost new/completely renovated';
      case 2:
        return '<b>C3</b>: <b>Above Avg</b><br>- Well maintained, limited depreciation<br>- Normal wear and tear<br>- Partial updating of short-lived items<br>- Effective age is less than actual age';
      case 3:
        return '<b>C4</b>: <b>Average</b><br>- Minor deferred maintenance/deterioration<br>- Normal wear and tear<br>- Minimal repairs may be needed<br>- Functionally adequate';
      case 4:
        return '<b>C5</b>: <b>Fair</b><br>- Obvious deferred maintenance<br>- Some repair/rehab/updating needed<br>- Livability is diminished due to condition<br>- Useable/functional as a residence';
      case 5:
        return '<b>C6</b>: <b>Poor</b><br>- Substantial damage/deferred maintenance<br>- Safety/structural integrity at risk<br>- Substantial repairs/rehabilitation needed<br>- Most major components affected';
      default:
        return '';
    }
  }

  getPropertyRentData(id, callbackHandler, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'property/' +
        encodeURIComponent(id) + '/buyAndHold', {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          let property = this.getCurrentProperty();
          this.propertyRent = data["userSelectedBuyAndHoldParameters"];
          if ("undefined" === typeof this.propertyRent.expenses.other) {
            this.propertyRent.expenses.other = 0;
          }
          if ("undefined" === typeof this.propertyRent.purchaseClosingCost.buyerPays) {
            this.propertyRent.purchaseClosingCost.buyerPays = false;
          }

          if ("undefined" === typeof this.propertyRent.purchaseClosingCost.resaleCertificate) {
            this.propertyRent.purchaseClosingCost.resaleCertificate = false;
          }

          if ("undefined" === typeof this.propertyRent.purchaseClosingCost.cash.loanDownPaymentFraction) {
            this.propertyRent.purchaseClosingCost.cash.loanDownPaymentFraction = 0;
          }

          if ("undefined" === typeof this.propertyRent.purchaseClosingCost.financed.loanDownPaymentFraction) {
            this.propertyRent.purchaseClosingCost.financed.loanDownPaymentFraction = 0.2;
          }

          this.setupRepairAndRemodel(this.propertyRent.repairs);
          this.recacheRepairs(property);
          this.recalcRentRepairCosts(property, true);

          this.propertyRent.purchaseClosingCost.cash.titlePolicy = Math.round(this.propertyRent.purchaseClosingCost.cash.titlePolicy);
          this.propertyRent.purchaseClosingCost.financed.titlePolicy = Math.round(this.propertyRent.purchaseClosingCost.financed.titlePolicy);
          this.propertyRent.purchaseClosingCost.financed.loanOrigination = Math.round(this.propertyRent.purchaseClosingCost.financed.loanOrigination);
          this.propertyRent.purchaseClosingCost.financed.loanDownPaymentFraction = 0.1;
          this.propertyRent.purchaseClosingCost.financed.taxEscrowMonths = 2;
          this.propertyRent.purchaseClosingCost.financed.taxEscrow = Math.floor(this.getTaxAmt() / 6);
          this.propertyRent.expenses.hoa = Math.round(this.propertyRent.expenses.hoa);
          this.propertyRent.expenses.insurance = 50; // Temporary - pending insurance settings
          this.propertyRent.expenses.realEstateTaxes = Math.round(this.getTaxAmt() / 12);

          this.propertyRentMeta = data;
          delete this.propertyRentMeta.userSelectedBuyAndHoldParameters;
          this.copyToCommon('rent');
          console.log("Setting propertyRent", this.propertyRent);
          this.generatePropertyRentDeps();
          callbackHandler();
        },
        error => errorHandler,
        () => console.log(this.propertyRent)
      );
  }

  resetPropertyCompsSearch() {
    this.propertyCompBippoId = null;
    this.propertyComps = [];
    this.propertyCompsSelected = [];
    this.propertyCompsBackground = [];
    this.propertyCompsExcluded = [];
    this.propertyCompsSelectedList = [];
    this.propertyCompsMeta = {
        numberofElements: 0,
        totalElements: 0,
        compsFilterUsed: {}
    };
  }

  getPropertyCompsData(id, type, successHandler, errorHandler) {
    this.propertyCompsType = type;
    this.propertyCompBippoId = id;
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});

    return this._http.get(environment.API_ENDPOINT + 'property/' +
      encodeURIComponent(id) + '/comps' + '?type=' + type, {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          let x: any;
          this.propertyComps = data["comps"];
          this.propertyCompsSelected = data["defaultComps"];
          this.propertyCompsBackground = data["backgroundComps"];
          this.propertyCompsExcluded = data["excludedComps"];
          this.propertyCompsSelectedList = [];

          if (this.propertyCompsSelected) {
            for (x of this.propertyCompsSelected) {
              this.propertyCompsSelectedList.push(this.getPropertyId(x));
            }
          }

          this.propertyCompsMeta = data;
          this.propertyCompSubjectValues = {};
          this.propertyCompsValues = {};
          this.propertyBippoId = null;
          delete this.propertyCompsMeta.comps;

          // Prevent error on filters form if the property has no comps
          if (null === this.propertyCompsMeta.compsFilterUsed) {
            this.propertyCompsMeta.compsFilterUsed = {};
          }

          if (("undefined" !== typeof this.property) && this.property && ("undefined" !== typeof this.property.market) && this.property.market) {
            if ("undefined" !== typeof this.propertyCompsMeta.arv && this.propertyCompsMeta.arv) {
              this.property.market.arv = this.propertyCompsMeta.arv.value;
            }

            if ("undefined" !== typeof this.propertyCompsMeta.asIs && this.propertyCompsMeta.asIs) {
              this.property.market.asIs = this.propertyCompsMeta.asIs.value;
            }

            if ("undefined" !== typeof this.propertyCompsMeta.wholesale && this.propertyCompsMeta.wholesale) {
              this.property.market.wholesale = this.propertyCompsMeta.wholesale.value;
            }

            if ("undefined" !== typeof this.propertyCompsMeta.rent && this.propertyCompsMeta.rent) {
              this.property.market.rentHigh = this.propertyCompsMeta.rent.high;
              this.property.market.rentLow = this.propertyCompsMeta.rent.low;
              this.property.market.rent = this.property.market.rentAverage = this.propertyCompsMeta.rent.average;
              this.propertyCompsMeta.rent.value = this.propertyCompsMeta.rent.average;
            }
          }

          console.log("Setting comps", this.propertyCompsMeta);
          successHandler();
        },
        error => errorHandler,
        () => console.log(this.propertyComps)
      );
  }

/*
  {
    "groups":  [
        {
            "status": "string",
            "count": "number",
            "group": [MultipleSourceBippoProperty, ...]
            "medians": {
                "beds": "int",
                "bathsFull": "int",
                "bathsHalf": "int",
                "garages": "int",
                "yearBuilt": "int",
                "pool": "string", // Y/N
                "pricePerSQFT": "int",
                "lotSizeInAcres: "Double",
                "listPrice": "int"
            },
            "minimum": {...},
            "maximum": {...},
            "averages": {...}
        }
    ]
  }
*/
  getAreaPropertyListings(id: string, successHandler, errorHandler) {
      let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
      return this._http.get(environment.API_ENDPOINT + 'property/' +
        encodeURIComponent(id) + '/area?radius=1', {headers: headers})
        .subscribe(
          res => {
            let data:any = res.json();
            let x: any;
            this.areaPropertyGroups = data["groups"];
            if (this.areaPropertyGroups) {
                this.areaPropertyGroups.sort(function(a, b) {
                    return a.status == b.status ? 0 : a.status > b.status ? 1 : -1;
                });
            }
            successHandler();
          },
          error => errorHandler,
          () => console.log(this.areaPropertyGroups)
        );
  }

  getCensus(zip, successHandler, errorHandler) {
    let headers = new Headers({ "Authorization": "Bearer " + this.authService.getToken() });
    return this._http.get(environment.API_ENDPOINT + 'census/' + zip, { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();
console.log(data);
          this.censusData = {};

          if (data.response && data.response.result && data.response.result.pkg && data.response.result.pkg.items) {
            let items = data.response.result.pkg.items;

            if (items.length) {
              this.censusData = items[0];
            }
          }

          successHandler();
        },
        error => errorHandler,
        () => console.log('Census ' + zip + ':', this.censusData)
      );
  }

  getPoi(zip, successHandler, errorHandler) {
    let headers = new Headers({ "Authorization": "Bearer " + this.authService.getToken() });
    return this._http.get(environment.API_ENDPOINT + 'poi/zip/' + zip, { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();

          if (data.response && data.response.result && data.response.result.pkg && data.response.result.pkg.items) {
            this.poiData = data.response.result.pkg.items;
          } else {
            this.poiData = [];
          }

          successHandler();
        },
        error => errorHandler,
        () => console.log('POI ' + zip + ':', this.poiData)
      );
  }

  getAnalytics(zip, successHandler, errorHandler) {
    let headers = new Headers({ "Authorization": "Bearer " + this.authService.getToken() });
    return this._http.get(environment.API_ENDPOINT + 'analytics/' + zip, { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();
          let prices = [];
          let counts = [];
          let labels = [];

          if (data.dataPointsByQuarter) {
            for (let datapt of data.dataPointsByQuarter) {
              prices.push(datapt.price);
              counts.push(datapt.count);
              labels.push('Q' + datapt.quarter + ' ' + datapt.year);
            }
          } else if (data.dataPointsByYear) {
            for (let datapt of data.dataPointsByYear) {
              prices.push(datapt.price);
              counts.push(datapt.count);
              labels.push('Year ' + datapt.year);
            }
          }

          data.priceDataPoints = prices;
          data.countDataPoints = counts;
          data.dataPointLabels = labels;
          this.analyticsData = data;

          successHandler();
        },
        error => errorHandler,
        () => console.log('Analytics ' + zip + ':', this.analyticsData)
      );
  }

  formatCurrencyDollar(value: any) {
    if ("number" === typeof value) {
      return '$' + numeral(value).format("0,0");
    } else {
      return '$0';
    }
  }

  formatPct(value: any) {
    if (value) {
      return numeral(parseFloat(value) * 100).format("0") + "%";
    } else {
      return "0%";
    }
  }

  formatPerSF(value: number) {
    return '$' + numeral(value).format("0,0.00") + ' / SF';
  }

  formatPerSY(value: number) {
    return '$' + numeral(value).format("0,0.00") + ' / square yard';
  }

  formatPerTon(value: number) {
    return '$' + numeral(value).format("0,0") + ' / ton';
  }

  formatPcs(value: number) {
    return String(value) + ((1 === value) ? ' pc' : ' pcs');
  }

  formatMonths(value: number) {
    return String(value) + ' months';
  }

  formatYears(value: number) {
    return String(value) + ' years';
  }

  formatFlipPriceType(value: string) {
    for (let t of this.propertyFlipListPriceTypes) {
      if (t.value === value) {
        return t.label;
      }
    }
    return "Other";
  };

  logScaling(minv, maxv, pos) {
    // position will be between 0 and 100
    let minp = 0;
    let maxp = 100;

    minv = Math.log(minv + 0.1);
    maxv = Math.log(maxv);

    // calculate adjustment factor
    let scale = (maxv-minv) / (maxp-minp);

    return Math.exp(minv + scale * (pos-minp));
  }

  logInverseScaling(minv, maxv, value) {
    // position will be between 0 and 100
    let minp = 0;
    let maxp = 100;

    minv = Math.log(minv + 0.1);
    maxv = Math.log(maxv);

    // calculate adjustment factor
    let scale = (maxv-minv) / (maxp-minp);
    let result = Math.round((((Math.log(value || 0.1) - minv) / scale) + minp) * 100) / 100;
    return (result >= 0) ? result : 0;
  }

  handleUpdateCompSliderField(event, field, min, max) {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsFilterUser) &&
        (null !== this.propertyCompsMeta.compsFilterUser)) {
        this.propertyCompsMeta.compsFilterUser[field] = Math.round(this.logScaling(min, max, event.relativePercentHorisontal));
    }
  }

  handleUpdateCompLinearSliderField(event, field, min, max) {
    let diff = max - min;
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsFilterUser) &&
        (null !== this.propertyCompsMeta.compsFilterUser)) {
        this.propertyCompsMeta.compsFilterUser[field] = min + Math.floor(diff * (event.relativePercentHorisontal / 100));
    }
  }

  handleFixCompSliderField(event, field, step) {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsFilterUser) &&
        (null !== this.propertyCompsMeta.compsFilterUser)) {
        this.propertyCompsMeta.compsFilterUser[field] = Math.round(this.propertyCompsMeta.compsFilterUser[field] / step) * step;
    }
  }

  getCompSliderFieldPct(field, min, max, def) {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsFilterUser) &&
        (null !== this.propertyCompsMeta.compsFilterUser)) {
        return String(this.logInverseScaling(min, max, this.propertyCompsMeta.compsFilterUser[field] || def)) + "%";
    } else {
        return String(def) + "%";
    }
  }

  toggleCompMlsStatus(ms) {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsFilterUser) &&
        (null !== this.propertyCompsMeta.compsFilterUser)) {
        let pos = this.propertyCompsMeta.compsFilterUser.statusRetsCode.indexOf(ms.value);
        if (-1 !== pos) {
          this.propertyCompsMeta.compsFilterUser.statusRetsCode.splice(pos, 1);
        } else {
          this.propertyCompsMeta.compsFilterUser.statusRetsCode.push(ms.value);
        }
    }
  }

  hasCompMlsStatus(ms) {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsFilterUser) &&
        (null !== this.propertyCompsMeta.compsFilterUser)) {
        return (-1 !== this.propertyCompsMeta.compsFilterUser.statusRetsCode.indexOf(ms.value));
    } else {
      return false;
    }
  }


  toggleCompSelected(id: any) {
    let pos;
    let x: any = null;
    let currentId: string;
    if ("string" !== typeof id) {
      x = id;
      id = this.getPropertyId(x);
    }
    pos = this.propertyCompsSelectedList.indexOf(<string>id);
    if (-1 !== pos) {
      this.propertyCompsSelected.splice(pos, 1);
      this.propertyCompsSelectedList.splice(pos, 1);
    } else {
      this.propertyCompsSelectedList.push(id);
      if (x) {
        this.propertyCompsSelected.push(x);
      } else {
        for (x of this.propertyComps) {
          currentId = this.getPropertyId(x);
          if (currentId === id) {
            this.propertyCompsSelected.push(x);
            break;
          }
        }
      }
    }
    x = this.propertyCompsSelectedList.splice(0);
    this.propertyCompsSelectedList = x;
  }

  isCompSelected(id: any) {
    if ("string" !== typeof id) {
      id = this.getPropertyId(id);
    }
    return (-1 !== this.propertyCompsSelectedList.indexOf(<string>id));
  }

  indexify(str: string) {
      return str.toLowerCase().replace(new RegExp(/\s/, 'g'), "");
  }

  generatePropertyFlipDeps() {
/*    this.propertyFlipData.repairAndRemodel.exterior.paintOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.exterior.paintOptions) {
      this.propertyFlipData.repairAndRemodel.exterior.paintOptions.push({
        'label': this.formatPerSF(x.cost),
        'value': x.cost
      });
    }

    this.propertyFlipData.repairAndRemodel.interior.paintOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.interior.paintOptions) {
      this.propertyFlipData.repairAndRemodel.interior.paintOptions.push({
        'label': this.formatPerSF(x.cost),
        'value': x.cost
      });
    }

    this.propertyFlipData.repairAndRemodel.exterior.roofOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.exterior.roofOptions) {
      this.propertyFlipData.repairAndRemodel.exterior.roofOptions.push({
        'label': x.type,
        'index': this.indexify(x.type),
        'value': x.cost
      });
    }

    this.propertyFlipData.repairAndRemodel.exterior.windowOptions = [];
    for (let x of [3]) {
      this.propertyFlipData.repairAndRemodel.exterior.windowOptions.push({
        'label': this.formatPcs(x),
        'value': x
      });
    }

    this.propertyFlipData.repairAndRemodel.interior.interiorDoorOptions = [{
        'label': this.formatPcs(1),
        'value': 1
    }];

    this.propertyFlipData.repairAndRemodel.interior.carpetedSurfaceOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.interior.carpetedSurfaceOptions) {
      this.propertyFlipData.repairAndRemodel.interior.carpetedSurfaceOptions.push({
        'label': this.formatPerSY(x.cost) + ' (' + x.type + ')',
        'value': x.cost
      });
    }

    this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.interior.hardFloorSurfaceOptions) {
      this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptions.push({
        'label': this.formatPerSF(x.cost) + ' (' + x.type + ')',
        'index': this.indexify(x.type),
        'value': x.cost
      });
    }

    this.propertyFlipData.repairAndRemodel.interior.kitchenApplianceOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.interior.kitchenApplianceOptions) {
      this.propertyFlipData.repairAndRemodel.interior.kitchenApplianceOptions.push({
        'label': this.formatCurrencyDollar(x.cost) + ' (' + x.type + ')',
        'value': x.type
      });
    }

    this.propertyFlipData.repairAndRemodel.interior.kitchenAppliancesSelected = [];
    for (let x of this.propertyFlip.repairAndRemodel.interior.kitchenAppliancesSelected) {
      this.propertyFlipData.repairAndRemodel.interior.kitchenAppliancesSelected.push(x.type);
    }

    this.propertyFlipData.repairAndRemodel.mechanicalSystems.hvacOptions = [];
    for (let x of this.propertyFlip.repairAndRemodel.mechanicalSystems.hvacOptions) {
      this.propertyFlipData.repairAndRemodel.mechanicalSystems.hvacOptions.push({
        'label': this.formatPerTon(x.costPerTon) + ' (' + x.type + ')',
        'value': x.costPerTon
      });
    }
*/
    this.propertyFlipData.expensesMonthsOptions = [];
    for (let x of [this.propertyFlip.expenses.months]) {
      this.propertyFlipData.expensesMonthsOptions.push({
        'label': this.formatMonths(x),
        'value': x
      });
    }

    this.updatePropertyExpenseMonthlyTotals();
  }

  getPropertyRevisions(id, type, page, errorHandler) {
    let propertyRevisionsType = 'property' + type.substr(0).toUpperCase() + type.substr(1) + 'Revisions';
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'property/'+
        encodeURIComponent(id) + '/'+type+'/revisions', {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          this[propertyRevisionsType] = data["content"];
          this[propertyRevisionsType + "Meta"] = data;
          delete this[propertyRevisionsType + "Meta"]["content"];
          console.log("Setting " + propertyRevisionsType, this[propertyRevisionsType]);
        },
        error => errorHandler,
        () => console.log(this[propertyRevisionsType])
      );
  }

  generatePropertyRentDeps() {
    this.propertyRentData.expenses.loanTermOptions = [];
    for (let x of this.propertyRent.expenses.loan.termOptions) {
      this.propertyRentData.expenses.loanTermOptions.push({
        'label': this.formatYears(x),
        'value': x
      });
    }

    this.propertyRentData.expenses.realEstateTaxesOptions = [];
    for (let x of [{type: 'Other', cost: 0}]) {
      this.propertyRentData.expenses.realEstateTaxesOptions.push({
        'label': x.type,
        'value': x.cost
      });
    }

    this.propertyRentData.expenses.insuranceOptions = [];
    for (let x of [{type: 'Other', cost: 0}]) {
      this.propertyRentData.expenses.insuranceOptions.push({
        'label': x.type,
        'value': x.cost
      });
    }

    this.propertyRentData.expenses.maintenanceOptions = [];
    for (let x of [{type: 'Other', percent: 0}]) {
      this.propertyRentData.expenses.maintenanceOptions.push({
        'label': x.type,
        'value': x.percent
      });
    }

    this.propertyRentData.expenses.managementOptions = [];
    for (let x of [{type: 'Other', percent: 0}]) {
      this.propertyRentData.expenses.managementOptions.push({
        'label': x.type,
        'value': x.percent
      });
    }

    this.propertyRentData.expenses.hoaOptions = [];
    this.propertyRentData.expenses.hoaOptions.push({
        'label': 'hoa',
        'value': 'hoa'
    });
  }

  getPropertyExpensesMatrix(id, months, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'property_flip_expenses/' +
        encodeURIComponent(id) + "?months=" + String(months), {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          this.propertyFlip.expenses = data;
          this.propertyFlip.expenses.months = months;
          console.log("Setting propertyFlipExpenses", this.propertyFlip.expenses);
          this.updatePropertyExpenseMonthlyTotals();
        },
        error => errorHandler,
        () => console.log(this.propertyFlip.expenses)
      );
  }

  selectFlipExteriorPaint(cost) {
    let paint: any;
    if (("undefined" !== typeof this.propertyFlip) &&
        this.propertyFlip &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel) &&
        this.propertyFlip.repairAndRemodel &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.exterior) &&
        this.propertyFlip.repairAndRemodel.exterior &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.exterior.paint) &&
        this.propertyFlip.repairAndRemodel.exterior.paint) {
        for (paint of this.propertyFlip.repairAndRemodel.exterior.paintOptions) {
            if (paint.cost === cost) {
                this.propertyFlip.repairAndRemodel.exterior.paint.cost = cost;
                this.propertyFlip.repairAndRemodel.exterior.paint.type = paint.type;
                break;
            }
        }
    }
  }

  selectFlipInteriorPaint(cost) {
    let paint: any;
    if (("undefined" !== typeof this.propertyFlip) &&
        this.propertyFlip &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel) &&
        this.propertyFlip.repairAndRemodel &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.interior) &&
        this.propertyFlip.repairAndRemodel.interior &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.interior.paint) &&
        this.propertyFlip.repairAndRemodel.interior.paint) {
        for (paint of this.propertyFlip.repairAndRemodel.interior.paintOptions) {
            if (paint.cost === cost) {
                this.propertyFlip.repairAndRemodel.interior.paint.cost = cost;
                this.propertyFlip.repairAndRemodel.interior.paint.type = paint.type;
                break;
            }
        }
    }
  }

  selectFlipExteriorRoof(cost) {
    let roof: any;
    if (("undefined" !== typeof this.propertyFlip) &&
        this.propertyFlip &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel) &&
        this.propertyFlip.repairAndRemodel &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.exterior) &&
        this.propertyFlip.repairAndRemodel.exterior &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.exterior.roof) &&
        this.propertyFlip.repairAndRemodel.exterior.roof) {
        for (roof of this.propertyFlip.repairAndRemodel.exterior.roofOptions) {
            if (roof.cost === cost) {
                this.propertyFlip.repairAndRemodel.exterior.roof.cost = cost;
                this.propertyFlip.repairAndRemodel.exterior.roof.type = roof.index;
                break;
            }
        }
    }
  }

  selectFlipExteriorWindows(count) {
    this.propertyFlip.repairAndRemodel.exterior.windows.count = count;
  }

  selectFlipInteriorCarpetedSurface(cost) {
    let carpet: any;
    if (("undefined" !== typeof this.propertyFlip) &&
        this.propertyFlip &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel) &&
        this.propertyFlip.repairAndRemodel &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.interior) &&
        this.propertyFlip.repairAndRemodel.interior &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.interior.carpetedSurface) &&
        this.propertyFlip.repairAndRemodel.interior.carpetedSurface) {
        for (carpet of this.propertyFlip.repairAndRemodel.interior.carpetedSurfaceOptions) {
            if (carpet.cost === cost) {
                this.propertyFlip.repairAndRemodel.interior.carpetedSurface.cost = cost;
                this.propertyFlip.repairAndRemodel.interior.carpetedSurface.type = carpet.type;
                break;
            }
        }
    }
  }

  selectFlipInteriorHardFloorSurface(type) {
    let hardFloor: any;
    if (("undefined" !== typeof this.propertyFlip) &&
        this.propertyFlip &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel) &&
        this.propertyFlip.repairAndRemodel &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.interior) &&
        this.propertyFlip.repairAndRemodel.interior &&
        ("undefined" !== typeof this.propertyFlip.repairAndRemodel.interior.hardFloorSurface) &&
        this.propertyFlip.repairAndRemodel.interior.hardFloorSurface) {
        for (hardFloor of this.propertyFlip.repairAndRemodel.interior.hardFloorSurfaceOptions) {
            if (hardFloor.type === type) {
                this.propertyFlip.repairAndRemodel.interior.hardFloorSurface.cost = hardFloor.cost;
                this.propertyFlip.repairAndRemodel.interior.hardFloorSurface.type = type;
                break;
            }
        }
    }
  }

  selectFlipInteriorDoor(count) {
    this.propertyFlip.repairAndRemodel.interior.interiorDoor.count = count;
  }

  selectFlipKitchenAppliances(arr) {
    let a: any;
    this.propertyFlipData.repairAndRemodel.interior.kitchenAppliancesSelected = arr;
    this.propertyFlip.repairAndRemodel.interior.kitchenAppliancesSelected = [];
    for (a of this.propertyFlip.repairAndRemodel.interior.kitchenApplianceOptions) {
      if (-1 !== arr.indexOf(a.type)) {
        this.propertyFlip.repairAndRemodel.interior.kitchenAppliancesSelected.push(a);
      }
    }
  }

  updatePropertyFlipTotals() {
    this.propertyFlipData.marketPriceSelectedValue = 0;

    if ("other" === this.propertyCommon.market.type || "Other" === this.propertyCommon.market.type) {
      this.propertyFlipData.marketPriceSelectedValue = this.propertyCommon.market.otherValue;
    } else if (("undefined" !== typeof this.propertyCommon.market) && this.propertyCommon.market
        && ("undefined" !== typeof this.propertyCommon.market.type) && this.propertyCommon.market.type) {
      this.propertyFlipData.marketPriceSelectedValue = this.property.market[this.propertyCommon.market.type];
    }

//    console.log('updatePropertyFlipTotals: ' + this.propertyCommon.market.type + ' selected, ' + this.propertyFlipData.marketPriceSelectedValue + ' resolved from:', this.property);
/*
    this.propertyFlipData.repairAndRemodel.exterior.windowTotal =
        this.propertyFlip.repairAndRemodel.exterior.windows.cost *
        this.propertyFlip.repairAndRemodel.exterior.windows.count;

    this.propertyFlipData.repairAndRemodel.interior.interiorDoorTotal =
        this.propertyFlip.repairAndRemodel.interior.interiorDoor.costPerUnit *
        this.propertyFlip.repairAndRemodel.interior.interiorDoor.count;

    this.propertyFlipData.repairAndRemodel.interior.lightFixtureTotal =
        this.propertyFlip.repairAndRemodel.interior.lightFixture.costPerUnit *
        this.propertyFlip.repairAndRemodel.interior.lightFixture.count;

    this.propertyFlipData.repairAndRemodel.mechanicalSystems.hvacTotal =
        this.propertyFlip.repairAndRemodel.mechanicalSystems.hvac.costPerTon *
        this.propertyFlip.repairAndRemodel.mechanicalSystems.hvac.tons;

    this.propertyFlipData.repairAndRemodel.mechanicalSystems.hotWaterHeaterTotal =
        this.propertyFlip.repairAndRemodel.mechanicalSystems.hotWaterHeater.cost *
        this.propertyFlip.repairAndRemodel.mechanicalSystems.hotWaterHeater.count;

    this.propertyFlipData.repairAndRemodel.interior.kitchenAppliancesTotal = 0;
    for (let x of this.propertyFlip.repairAndRemodel.interior.kitchenAppliancesSelected) {
        this.propertyFlipData.repairAndRemodel.interior.kitchenAppliancesTotal += x.cost;
    }
*/
    let property = this.getCurrentProperty();
/*
    if (property && ("undefined" !== typeof property.building) &&
      (null !== property.building) &&
      ("undefined" !== typeof property.building.size) &&
      (null !== property.building.size)) {
      this.propertyFlipData.repairAndRemodel.exterior.paintTotal =
        this.propertyFlip.repairAndRemodel.exterior.paint.cost *
        property.building.size.bldgSize;
    } else {
      this.propertyFlipData.repairAndRemodel.exterior.paintTotal = 0;
    }
    if (property && ("undefined" !== typeof property.building) &&
      (null !== property.building) &&
      ("undefined" !== typeof property.building.size) &&
      (null !== property.building.size)) {
      this.propertyFlipData.repairAndRemodel.interior.paintTotal =
        this.propertyFlip.repairAndRemodel.interior.paint.cost *
        property.building.size.livingSize;
    }
    if ('repair' === this.propertyFlip.repairAndRemodel.exterior.roof.type) {
      this.propertyFlipData.repairAndRemodel.exterior.roofOptionValue =
        this.propertyFlip.repairAndRemodel.exterior.roofOptionRepairValue;
    } else {
      this.propertyFlipData.repairAndRemodel.exterior.roofOptionValue =
        this.propertyFlip.repairAndRemodel.exterior.roof.cost;
    }

    if ('Repair' === this.propertyFlip.repairAndRemodel.interior.hardFloorSurface.type) {
      this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptionValue =
        this.propertyFlip.repairAndRemodel.interior.hardFloorSurfaceOptionRepairValue;
    } else {
      this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptionValue = 0;
      for (let x of this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptions) {
        if (x.index === this.propertyFlip.repairAndRemodel.interior.hardFloorSurface.type) {
            this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptionValue =
              x.value;
        }
      }
    }

    if (property && ("undefined" !== typeof property.building) &&
      (null !== property.building) &&
      ("undefined" !== typeof property.building.size) &&
      (null !== property.building.size)) {
        if ("repair" === this.propertyFlip.repairAndRemodel.interior.hardFloorSurface.type) {
          this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfacesTotal =
            this.propertyFlip.repairAndRemodel.interior.hardFloorSurfaceOptionRepairValue;
        } else {
          this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfacesTotal =
            Math.ceil(this.propertyFlooringScaling.hard *
            this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfaceOptionValue *
            property.building.size.livingSize / 100) * 100;
        }

        this.propertyFlipData.repairAndRemodel.interior.carpetedSurfacesTotal =
          Math.ceil(this.propertyFlooringScaling.carpet *
          this.propertyFlip.repairAndRemodel.interior.carpetedSurface.cost *
          property.building.size.livingSize / 900) * 100;
    } else {
      this.propertyFlipData.repairAndRemodel.interior.hardFloorSurfacesTotal = 0;
      this.propertyFlipData.repairAndRemodel.interior.carpetedSurfacesTotal = 0;
    }
*/
    this.propertyFlipData.purchaseClosingCostTotal = 0;
    if (-1 !== ["cash", "financed"].indexOf(this.propertyFlip.purchaseClosingCost.selected)) {
        this.propertyFlipData.purchaseClosingCostSubtotal =
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].insurance +
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].realEstateTaxes +
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].survey +
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].loanOrigination +
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].transferTax +
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].titleCompanyFees +
            +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].titleCompanyEscrowFees;
        if (this.propertyFlip.purchaseClosingCost.buyerPays) {
            this.propertyFlipData.purchaseClosingCostSubtotal +=
                +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].titlePolicy;
        }
        if (this.propertyFlip.purchaseClosingCost.resaleCertificate) {
            this.propertyFlipData.purchaseClosingCostSubtotal +=
                +this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].hoa;
        }
    }

    this.propertyFlipData.loanDownPayment =
        Math.round(+this.propertyFlip.purchaseClosingCost[this.propertyFlip.purchaseClosingCost.selected].loanDownPaymentFraction *
        (this.propertyFlipData.marketPriceSelectedValue - this.propertyFlipData.purchaseClosingCostSubtotal) * 100) / 100;

    this.propertyFlipData.purchaseClosingCostTotal =
        this.propertyFlipData.purchaseClosingCostSubtotal +
        +this.propertyFlipData.loanDownPayment;

    this.propertyFlip.expenses.insurance =
        +this.propertyFlipData.expenses.insurance *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.realEstateTaxes =
        +this.propertyFlipData.expenses.realEstateTaxes *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.mowing =
        +this.propertyFlipData.expenses.mowing *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.hoa =
        +this.propertyFlipData.expenses.hoa *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.poolService =
        +this.propertyFlipData.expenses.poolService *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.financing =
        +this.propertyFlipData.expenses.financing *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.other =
        +this.propertyFlipData.expenses.other *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.utilityCosts.waterAndSewer =
        +this.propertyFlipData.expenses.utilityCosts.waterAndSewer *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.utilityCosts.electrical =
        +this.propertyFlipData.expenses.utilityCosts.electrical *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.utilityCosts.gas =
        +this.propertyFlipData.expenses.utilityCosts.gas *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.utilityCosts.alarm =
        +this.propertyFlipData.expenses.utilityCosts.alarm *
        +this.propertyFlip.expenses.months;
    this.propertyFlip.expenses.utilityCosts.other =
        +this.propertyFlipData.expenses.utilityCosts.other *
        +this.propertyFlip.expenses.months;

    this.propertyFlipData.expenses.utilityCostsMonthlyTotal =
        +this.propertyFlipData.expenses.utilityCosts.waterAndSewer +
        +this.propertyFlipData.expenses.utilityCosts.electrical +
        +this.propertyFlipData.expenses.utilityCosts.gas +
        +this.propertyFlipData.expenses.utilityCosts.alarm +
        +this.propertyFlipData.expenses.utilityCosts.other;

    this.propertyFlipData.expenses.utilitiesTotal =
        this.propertyFlipData.expenses.utilityCostsMonthlyTotal *
        +this.propertyFlip.expenses.months;

    this.propertyFlipData.expensesTotal =
        +this.propertyFlip.expenses.insurance +
        //+this.propertyFlip.expenses.realEstateTaxes +
        +this.propertyFlip.expenses.mowing +
        +this.propertyFlipData.expenses.utilitiesTotal +
        +this.propertyFlip.expenses.hoa +
        +this.propertyFlip.expenses.poolService +
        +this.propertyFlip.expenses.other;

    this.propertyFlipData.sellingClosingCostTotal =
        +this.propertyFlip.sellingClosingCost.titlePolicy +
        +this.propertyFlip.sellingClosingCost.titleCompanyFees +
        Math.round(+this.propertyFlip.sellingClosingCost.realEstateCommission * this.property.market.arv) +
        // Add real estate expenses taxes?
        +this.propertyFlip.expenses.realEstateTaxes +
        //+this.propertyFlip.sellingClosingCost.realEstateTaxes +
        //+this.propertyFlip.sellingClosingCost.hoaResale +
        +this.propertyFlip.sellingClosingCost.miscLender +
        +this.propertyFlip.sellingClosingCost.other;

    if (!this.propertyFlip.expenses.hoaAbsent) {
        this.propertyFlipData.sellingClosingCostTotal += +this.propertyFlip.sellingClosingCost.hoaResale;
    }

    if (this.propertyFlip.purchaseClosingCost.selected == "financed") {
        this.propertyFlip.expensesTotal += this.propertyFlip.expenses.financing;
    }

    if (this.propertyFlip.repairAndRemodel.selectedRepairs) {
      let total = 0;

      for (let item of this.propertyFlip.repairAndRemodel.selectedRepairs) {
        if (item.included && item.cost) {
          total += item.cost;
        }
      }

      this.propertyFlipData.repairRemodelTotal = total;
    } else if (this.propertyFlip.repairAndRemodel.repairsByQuality && ("undefined" !== this.propertyFlip.repairAndRemodel.selectedQuality)) {
      let repairs = this.propertyFlip.repairAndRemodel.repairsByQuality[this.propertyFlip.repairAndRemodel.selectedQuality];
      let total = 0;

      for (let item of repairs.items) {
        if (item.included && item.cost) {
          total += item.cost;
        }
      }

      this.propertyFlipData.repairRemodelTotal = total;
    }

    this.propertyFlipData.costToFlip =
        this.propertyFlipData.purchaseClosingCostTotal +
        this.propertyFlipData.repairRemodelTotal +
        this.propertyFlipData.expensesTotal +
        this.propertyFlipData.sellingClosingCostTotal;

    if (this.propertyFlip.purchaseClosingCost.retainProfit) {
      // One-shot flag to retain the profit (and by extension, the startingBid / maxBid)
      this.propertyFlip.purchaseClosingCost.retainROI = false;
      this.setROI();
    } else {
      this.propertyFlipData.maxBid = Math.floor(this.propertyFlipData.marketPriceSelectedValue - (this.propertyFlipData.costToFlip + this.propertyFlip.profit));
      this.propertyFlipData.startingBid = Math.ceil((this.propertyFlipData.maxBid * 0.97) / 100) * 100;
      this.setROI();
    }
  }

  setROI() {
    this.propertyFlipData.roi = this.propertyFlip.profit /
        (this.propertyFlipData.maxBid + this.propertyFlipData.costToFlip);
    let roiRounded = Math.round(this.propertyFlipData.roi * 1000) / 10;
    if (roiRounded > 100) {
      this.propertyFlipData.ROIFormatted = '>100%';
      this.propertyFlipData.absROIFormatted = '100%';
    } else if (roiRounded < -100) {
      this.propertyFlipData.ROIFormatted = '<-100%';
      this.propertyFlipData.absROIFormatted = '100%';
    } else {
      this.propertyFlipData.ROIFormatted = String(roiRounded) + '%';
      this.propertyFlipData.absROIFormatted = String(Math.abs(roiRounded)) + '%';
    }
  }

  updatePropertyRentTotals() {
    for (let field of ['realEstateTaxes', 'insurance', 'maintenance', 'management']) {
      if ("number" !== typeof this.propertyRent.expenses[field]) {
        this.propertyRent.expenses[field] = parseInt(this.propertyRent.expenses[field]) || 0;
      }
    }

    if ("other" === this.propertyCommon.market.type || "Other" === this.propertyCommon.market.type) {
      this.propertyRentData.marketPriceSelectedValue = this.propertyCommon.market.otherValue;
    } else if (("undefined" !== typeof this.propertyCommon.market) && this.propertyCommon.market &&
        ("undefined" !== typeof this.propertyCommon.market.type) && this.propertyCommon.market.type) {
      this.propertyRentData.marketPriceSelectedValue = this.property.market[this.propertyCommon.market.type];
    }

    if ("other" === this.propertyRent.rent.type) {
      this.propertyRentData.rentPriceSelectedValue = this.propertyRent.rent.otherValue;
    } else {
      switch (this.propertyRent.rent.type) {
        case "renta":
          if (this.property && this.property.market) {
            this.propertyRent.rent.value = this.property.market.rentLow || 1200;
          } else {
            this.propertyRent.rent.value = 1200;
          }

          break;
        case "rentb":
          if (this.property && this.property.market) {
            this.propertyRent.rent.value = this.property.market.rentHigh || 1800;
          } else {
            this.propertyRent.rent.value = 1800;
          }

          break;
        default:
          this.propertyRent.rent.value = 0;
          break;
      }
//      for (let rent of this.propertyRent.rent.rentOptions) {
//        if (this.propertyRent.rent.type === rent.type) {
//          this.propertyRent.rent.value = rent.value;
//          break;
//        }
//      }

      this.propertyRentData.rentPriceSelectedValue =  this.propertyRent.rent.value;
    }

    let property = this.getCurrentProperty();

    this.propertyRentData.repairTotal = 0;

    for (let item of this.propertyRent.repairs.selectedRepairs) {
      if (item.included && item.cost > 0 ) {
        this.propertyRentData.repairTotal += item.cost;
      }
    }

/*    for (let field in this.propertyRent.repairs) {
      if (this.propertyRent.repairs[field]['included']) {
        if ("undefined" !== typeof this.propertyRent.repairs[field]['perUnit']) {
          this.propertyRentData.repairs[field] = this.propertyRent.repairs[field]['perUnit'] * this.propertyRent.repairs[field]['value'];
          this.propertyRentData.repairTotal += this.propertyRentData.repairs[field];
        } else {
          switch (field) {
            case 'interiorPaint':
              if (property && ("undefined" !== typeof property.building) && (null !== property.building) && ("undefined" !== typeof property.building.size) && (null !== property.building.size)) {
                this.propertyRentData.repairs[field] = this.propertyRent.repairs[field]['value'] * property.building.size.livingSize;
                this.propertyRentData.repairTotal += this.propertyRentData.repairs[field];
              }
              break;
            case 'exteriorPaint':
              if (property && ("undefined" !== typeof property.building) && (null !== property.building) && ("undefined" !== typeof property.building.size) && (null !== property.building.size)) {
                this.propertyRentData.repairs[field] = this.propertyRent.repairs[field]['value'] * property.building.size.bldgSize;
                this.propertyRentData.repairTotal += this.propertyRentData.repairs[field];
              }
              break;
            case 'carpet':
              if (property && ("undefined" !== typeof property.building) && (null !== property.building) && ("undefined" !== typeof property.building.size) && (null !== property.building.size)) {
                this.propertyRentData.repairs[field] = Math.ceil(this.propertyFlooringScaling.carpet * this.propertyRent.repairs[field]['value'] * property.building.size.livingSize / 900) * 100;
                this.propertyRentData.repairTotal += this.propertyRentData.repairs[field];
              }
              break;
            case 'hardFloorSurfaces':
              if (property && ("undefined" !== typeof property.building) && (null !== property.building) && ("undefined" !== typeof property.building.size) && (null !== property.building.size)) {
                this.propertyRentData.repairs[field] = Math.ceil(this.propertyFlooringScaling.hard * this.propertyRent.repairs[field]['value'] * property.building.size.livingSize / 100) * 100;
                this.propertyRentData.repairTotal += this.propertyRentData.repairs[field];
              }
              break;
          }
        }
      }
    }*/

    this.propertyRentData.loanDownPayment = 0;

    this.propertyRentData.purchaseClosingCostTotal = 0;
    if (-1 !== ["cash", "financed"].indexOf(this.propertyRent.purchaseClosingCost.selected)) {
        this.propertyRentData.purchaseClosingCostSubtotal =
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].insurance +
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].realEstateTaxes +
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].survey +
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].loanOrigination +
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].transferTax +
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].titleCompanyFees +
            this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].titleCompanyEscrowFees;

        if (this.propertyRent.purchaseClosingCost.buyerPays) {
            this.propertyRentData.purchaseClosingCostSubtotal +=
                this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].titlePolicy;
        }

        if (this.propertyRent.purchaseClosingCost.resaleCertificate) {
            this.propertyRentData.purchaseClosingCostSubtotal +=
                this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].hoa;
        }

        this.propertyRentData.loanDownPayment =
            Math.round(this.propertyRent.purchaseClosingCost[this.propertyRent.purchaseClosingCost.selected].loanDownPaymentFraction *
            (this.propertyRentData.marketPriceSelectedValue - (this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostSubtotal + this.propertyRent.income.cap)) / 100) * 100;

        this.propertyRentData.purchaseClosingCostTotal =
            this.propertyRentData.purchaseClosingCostSubtotal +
            this.propertyRentData.loanDownPayment;
    }

    if ('other' === this.propertyRent.expenses.mortgage.selected) {
        this.propertyRentData.expenses.mortgageSelectedValue =
            this.propertyRent.expenses.mortgage.otherValue;
    } else {
        if (this.propertyRent.expenses.loan.interestRatePercent && this.propertyRent.expenses.loan.termSelected) {
            this.propertyRentData.expenses.mortgageSelectedValue =
                Math.ceil(this.mortgagePayment(
                    this.propertyRent.expenses.loan.interestRatePercent / 12,
                    12 * this.propertyRent.expenses.loan.termSelected,
                    this.propertyRentData.loanDownPayment - this.propertyRentData.maxBid
                ));
        } else {
            this.propertyRentData.expenses.mortgageSelectedValue = 0;
        }
    }

    this.propertyRentData.expenses.vacancyRate =
        Math.ceil(this.propertyRentData.rentPriceSelectedValue * this.propertyRent.expenses.vacancyRatePercent);
    this.propertyRentData.expenses.management =
        Math.ceil(this.propertyRentData.rentPriceSelectedValue * this.propertyRent.expenses.managementPercent);
    this.propertyRentData.expenses.maintenance =
        Math.ceil(this.propertyRentData.rentPriceSelectedValue * this.propertyRent.expenses.maintenancePercent);

    this.propertyRentData.expensesSubtotal =
        this.propertyRent.expenses.realEstateTaxes +
        this.propertyRent.expenses.insurance +
        this.propertyRentData.expenses.vacancyRate +
        this.propertyRent.expenses.maintenance +
        this.propertyRent.expenses.management +
        this.propertyRentData.expenses.mortgageSelectedValue +
        this.propertyRent.expenses.hoa +
        this.propertyRent.expenses.other;
    this.propertyRentData.expensesTotal =
        this.propertyRentData.expensesSubtotal;

    this.propertyRent.income.net =
      Math.floor(this.propertyRentData.rentPriceSelectedValue -
        (this.propertyRentData.expensesTotal +
        (this.propertyRentData.repairTotal / 12)));

    if (this.propertyRent.purchaseClosingCost.retainProfit) {
      // Stateful flag to retain profit and bids, we keep doing this until the CAP is manually changed
    } else {
      this.propertyRentData.maxBid = Math.floor(this.propertyRentData.marketPriceSelectedValue -
          (this.propertyRentData.repairTotal +
          this.propertyRentData.purchaseClosingCostSubtotal +
          this.propertyRent.income.cap));
      this.propertyRentData.startingBid = Math.ceil((this.propertyRentData.maxBid * 0.97) / 100) * 100;
    }

    this.propertyRentData.annualProfit = (this.propertyRentData.rentPriceSelectedValue * 12) -
        (this.propertyRentData.expensesTotal * 12);
    this.propertyRentData.absAnnualProfit = Math.abs(this.propertyRentData.annualProfit);

    this.setNOI();
  }

  setNOI() {
    let baseCap;
    if ("cash" === this.propertyRent.purchaseClosingCost.selected) {
        let upperBid = this.propertyRentData.marketPriceSelectedValue -
            (this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostTotal);
        baseCap = (this.propertyRent.income.net * 12) /
            (this.propertyRentData.upperBid +
            this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostTotal);

        this.propertyRent.income.capPercent = (this.propertyRent.income.net * 12) /
            (this.propertyRentData.maxBid +
            this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostTotal);
    } else {
        this.propertyRent.income.capPercent = (this.propertyRent.income.net * 12) /
            (this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostTotal);
    }
    let capRounded = Math.round(this.propertyRent.income.capPercent * 1000) / 10;
    let baseCapRounded = capRounded - (Math.round(baseCap * 1000) / 10);
    if (capRounded > 100) {
      this.propertyRentData.capFormatted = '>100%';
      this.propertyRentData.absCapFormatted = '100%';
    } else if (capRounded < -100) {
      this.propertyRentData.capFormatted = '<-100%';
      this.propertyRentData.absCapFormatted = '100%';
    } else {
      this.propertyRentData.capFormatted = String(capRounded) + '%';
      this.propertyRentData.absCapFormatted = String(Math.abs(capRounded)) + '%';
    }
    if (baseCapRounded > 100) {
      this.propertyRentData.absBaseCapFormatted = '100%';
    } else if (baseCapRounded < -100) {
      this.propertyRentData.absBaseCapFormatted = '100%';
    } else {
      this.propertyRentData.absBaseCapFormatted = String(Math.abs(baseCapRounded)) + '%';
    }
  }

  adjustProfitByPct(pct: number) {
    this.propertyFlip.profit =
      Math.floor((this.propertyFlipData.maxBid + this.propertyFlipData.costToFlip) * (pct / 100));
    this.setROI();
  }

  fixProfit() {
    this.propertyFlip.profit = Math.ceil(this.propertyFlip.profit / 100) * 100;
    this.setROI();
  }

  adjustCapIncomeByPct(pct: number) {
    if ("cash" === this.propertyRent.purchaseClosingCost.selected) {
        this.propertyRent.income.cap = Math.floor((this.propertyRentData.marketPriceSelectedValue -
            (this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostTotal)) * (pct / 100));
    } else {
        this.propertyRent.income.cap = Math.floor((this.propertyRentData.marketPriceSelectedValue -
            (this.propertyRentData.repairTotal +
            this.propertyRentData.purchaseClosingCostSubtotal)) * (pct / 100));
    }
    this.setNOI();
  }

  fixCapIncome() {
    this.propertyRent.income.cap = Math.ceil(this.propertyRent.income.cap / 100) * 100;
    this.setNOI();
  }

  updatePropertyExpenseMonthlyTotals() {
    this.propertyFlipData.expenses.utilityCosts.waterAndSewer =
        Math.round(this.propertyFlip.expenses.utilityCosts.waterAndSewer / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.utilityCosts.electrical =
        Math.round(this.propertyFlip.expenses.utilityCosts.electrical / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.utilityCosts.gas =
        Math.round(this.propertyFlip.expenses.utilityCosts.gas / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.utilityCosts.alarm =
        Math.round(this.propertyFlip.expenses.utilityCosts.alarm / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.utilityCosts.other =
        Math.round(this.propertyFlip.expenses.utilityCosts.other / this.propertyFlip.expenses.months);

    this.propertyFlipData.expenses.insurance =
        Math.round(this.propertyFlip.expenses.insurance / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.realEstateTaxes =
        Math.round(this.propertyFlip.expenses.realEstateTaxes / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.mowing =
        Math.round(this.propertyFlip.expenses.mowing / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.hoa =
        Math.round(this.propertyFlip.expenses.hoa / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.poolService =
        Math.round(this.propertyFlip.expenses.poolService / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.financing =
        Math.round(this.propertyFlip.expenses.financing / this.propertyFlip.expenses.months);
    this.propertyFlipData.expenses.other =
        Math.round(this.propertyFlip.expenses.other / this.propertyFlip.expenses.months);
  }

  addPropertyRentRepair(field, value) {
    console.log('addPropertyRentRepair NYI');
/*    if (1 === value) {
      this.propertyRent.repairs[field].value = (this.propertyRent.repairs[field].value || 0) + value;
    } else if (this.propertyRent.repairs[field].value && (-1 === value)) {
      this.propertyRent.repairs[field].value--;
    }*/
  }

  getCurrentFlipRepairItems() {
    let rr = this.propertyFlip.repairAndRemodel;

    if (rr.selectedRepairs) {
      return rr.selectedRepairs;
    } else if (("undefined" !== typeof rr.selectedQuality) && rr.repairsByQuality) {
      return rr.repairsByQuality[rr.selectedQuality].items;
    }

    return [];
  }

  getCurrentRentRepairItems() {
    let rr = this.propertyRent.repairs;

    if (rr.selectedRepairs) {
      return rr.selectedRepairs;
    } else if (("undefined" !== typeof rr.selectedQuality) && rr.repairsByQuality) {
      return rr.repairsByQuality[rr.selectedQuality].items;
    }

    return [];
  }

  toggleRepairIncluded(field: string) {
/*    this.propertyRent.repairs[field].included = !this.propertyRent.repairs[field].included;*/
  }

  toggleFlipNoRepairs() {
    this.toggleNoRepairs0(this.propertyFlip.repairAndRemodel);

    if (this.syncRepairData) {
      this.toggleNoRepairs0(this.propertyRent.repairs);
    }
  }

  toggleRentNoRepairs() {
    this.toggleNoRepairs0(this.propertyRent.repairs);

    if (this.syncRepairData) {
      this.toggleNoRepairs0(this.propertyFlip.repairAndRemodel);
    }
  }

  toggleNoRepairs0(rr) {
    if (rr.noRepairs) {
      rr.noRepairs = false;
      return;
    } else if (rr.selectedRepairs) {
      rr.noRepairs = true;

      for (let item of rr.selectedRepairs) {
        item.included = false;
      }
    } else if (rr.repairsByQuality && ("undefined" !== rr.selectedQuality)) {
      rr.noRepairs = true;
      let repairs = rr.repairsByQuality[rr.selectedQuality];

      for (let item of repairs.items) {
        item.included = false;
      }
    }
  }

  resetFlipRepairs() {
    this.resetRepairs0(this.propertyFlip.repairAndRemodel);

    if (this.syncRepairData) {
      this.resetRepairs0(this.propertyRent.repairs);
    }
  }

  resetRentRepairs() {
    this.resetRepairs0(this.propertyRent.repairs);

    if (this.syncRepairData) {
      this.resetRepairs0(this.propertyFlip.repairAndRemodel);
    }
  }

  resetRepairs0(rr) {
    rr.noRepairs = false;

    if (rr.selectedRepairs) {
      for (let item of rr.selectedRepairs) {
        item.included = false;
      }
    }

    if (rr.repairsByQuality && ("undefined" !== rr.selectedQuality)) {
      let repairs = rr.repairsByQuality[rr.selectedQuality];

      for (let item of repairs.items) {
        item.included = false;
      }
    }
  }

  toggleFlipRepairIncluded(item) {
    this.toggleFlipRepairIncluded0(item);

    if (this.syncRepairData) { // TODO This sync mechanism will need to be addressed when custom repairs are added to one array but not the other
      this.toggleRentRepairIncluded0(this.getCurrentRentRepairItems()[item.index]);
    }
  }

  toggleRentRepairIncluded(item) {
    this.toggleRentRepairIncluded0(item);

    if (this.syncRepairData) {
      this.toggleFlipRepairIncluded0(this.getCurrentFlipRepairItems()[item.index]);
    }
  }

  toggleFlipRepairIncluded0(item) {
    if (item.included) {
      item.included = false;
      this.propertyFlipData.repairRemodelTotal -= item.cost;
    } else {
      item.included = true;
      this.propertyFlip.repairAndRemodel.noRepairs = false;
      this.propertyFlipData.repairRemodelTotal += item.cost;
    }

    console.log('set repairRemodelTotal = ' + this.propertyFlipData.repairRemodelTotal);
  }

  toggleRentRepairIncluded0(item) {
    if (item.included) {
      item.included = false;
    } else {
      item.included = true;
      this.propertyRent.repairs.noRepairs = false;
    }
  }

  mortgagePayment(rate: number, nper: number, pv: number) {
    let pvif: number = Math.pow( 1 + rate, nper);
    let pmt: number = rate / (pvif - 1) * -(pv * pvif);

    return pmt;
  }

  convertToWords(str: string) {
    let result: string;
    switch (str) {
      case 'purchaseClosingCost.selected':
        return "Purchase Closing Cost Method";
      case 'hoa':
        return str.toUpperCase();
      case 'market.value':
        return "Market Price";
      case 'market.otherValue':
        return "Market Price Value";
      case 'repairAndRemodel':
        return "Repair/Remodel";
      case 'paint.type':
      case 'paint.cost':
        return "Paint";
      case 'roof.type':
      case 'roof.cost':
        return "Roof";
      case 'roofOptionRepairValue':
        return "Roof Repair Cost";
      case 'carpetedSurface.type':
      case 'carpetedSurface.cost':
        return "Carpeted Surfaces";
      case 'hardFloorSurface.type':
      case 'hardFloorSurface.cost':
        return "Hard Floor Surfaces";
      case 'hardFloorSurfaceOptionRepairValue':
        return "Hard Floor Surfaces Repair Cost";
      case 'kitchenAppliancesSelected':
        return "Kitchen Appliances";
      case 'hvac.type':
      case 'hvac.costPerTon':
      case 'hvac.tons':
        return "HVAC";
      case 'waterAndSewer':
        return "Water/Sewer";
      default:
        result = str.replace( /([A-Z])/g, " $1" );
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
  }

  getFirstPhoto(property = undefined, valueset = undefined) {
    if ("undefined" === typeof property) {
      property = this.property;
    }
    if ("undefined" === typeof valueset) {
      valueset = "hitMergedResponse";
    }
    if (property && ("undefined" !== typeof property[valueset]) &&
        property[valueset]) {
        property = property[valueset];
    }

    return (property
            && ("undefined" !== typeof property.resources) && property.resources
            && ("undefined" !== typeof property.resources.photos) && property.resources.photos
            && property.resources.photos.urls.length > 0) ?
        property.resources.photos.urls[0] : null;
  }

  getPropertyRentPrice(type = 'renta') {
    if (("undefined" !== typeof this.propertyRent) &&
        (null !== this.propertyRent) &&
        ("undefined" !== typeof this.propertyRent.rent) &&
        (null !== this.propertyRent.rent) &&
        ("undefined" !== typeof this.propertyRent.rent.rentOptions) &&
        (null !== this.propertyRent.rent.rentOptions)) {
        for (let x of this.propertyRent.rent.rentOptions) {
          if (type === x.type) {
            return '$' + numeral(x.value).format("0,0");
          }
        }
    }
    return "$0";
  }

  getPropertyCompPrice() {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta[this.propertyCompsType]) &&
        (null !== this.propertyCompsMeta[this.propertyCompsType])) {
        return numeral(this.propertyCompsMeta[this.propertyCompsType].value).format("0,0");
    }
    return null;
  }

  getPropertyTaxDescription() {
    let prop = this.getCurrentProperty();
    return prop.area.countrysecsubd + " " + prop.assessment.tax.taxYear + " Unexempt Annual";
  }

  getFootageSourceDescription(prop) {
    if (!prop) {
      prop = this.getCurrentProperty();
    }

    if (prop.building && prop.building.size) {
      return prop.building.size.bldgSize + ' sqft / ' + prop.building.size.bldgSizeSource;
    }

    return '';
  }

  describeCompProperties() {
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.compsNarrative) &&
        (null !== this.propertyCompsMeta.compsNarrative)) {
        return this.propertyCompsMeta.compsNarrative;
    }
    return "";
  }

  describeSelectedCompProperties() {
    let desc = "";
    if (("undefined" !== typeof this.propertyCompsMeta) &&
        (null !== this.propertyCompsMeta) &&
        ("undefined" !== typeof this.propertyCompsMeta.solds) &&
        (null !== this.propertyCompsMeta.solds) &&
        ("undefined" !== typeof this.propertyCompsMeta.solds.selected) &&
        (null !== this.propertyCompsMeta.solds.selected) &&
        (this.propertyCompsMeta.solds.selected.length > 0)) {
      let propertiesDesc = [];
      for (let property of this.propertyCompsMeta.solds.selected) {
        let thisDesc = property.address + " is " +
            numeral(property.distance).format("0,0.00") +
            " miles from the subject";
        if ((null !== property.closingDate) && ("" !== property.closingDate)) {
           let duration = moment.duration(moment().diff(property.closingDate)).asDays();
           if (duration > 1) {
             thisDesc += " and closed in the past " + String(duration) + " days";
           } else if (1 === duration) {
             thisDesc += " and closed yesterday";
           } else {
             thisDesc += " and closed today";
           }
        }
        propertiesDesc.push(thisDesc);
      }
      for (let index = 0; index < propertiesDesc.length - 1; index++) {
        if (0 !== index) {
          desc += ", " + propertiesDesc[index];
        } else {
          desc += propertiesDesc[index];
        }
      }
      if (propertiesDesc.length >= 2) {
        desc += ", and " + propertiesDesc[propertiesDesc.length - 1];
      }
      if (propertiesDesc.length >= 1) {
        desc += ".";
      }
    }
    return desc;
  }

  // Convert numbers to words
  // copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
  // permission to use this Javascript on your web page is granted
  // provided that all of the code (including this copyright notice) is
  // used exactly as shown (you can change the numbering system if you wish)
  convertNumberToWords(num: number) {
    // American Numbering System
    let th = ['','thousand','million','billion','trillion'];
    let dg = ['zero','one','two','three','four','five','six','seven','eight','nine'];
    let tn = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    let tw = ['twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
    if (("undefined" === typeof num) || (null === num)) {
      return "";
    }
    let s = num.toString();
    s = s.replace(/[\, ]/g,'');
    if (s !== String(parseFloat(s))) {
      return 'not a number';
    }
    let x = s.indexOf('.');
    if (x === -1) {
      x = s.length;
    }
    if (x > 15) {
      return 'too big';
    }
    let n = s.split('');
    let str = '',
        sk = 0;

    for (let i=0; i < x; i++) {
      if ((x-i)%3===2) {
        if (n[i] === '1') {
          str += tn[Number(n[i+1])] + ' ';
          i++;
          sk=1;
        } else if (n[i]!=='0') {
          str += tw[Number(n[i])-2] + ' ';
          sk=1;
        }
      } else if (n[i]!=='0') {
        str += dg[n[i]] +' ';
        if ((x-i)%3===0) {
          str += 'hundred ';
        }
        sk=1;
      } if ((x-i)%3===1) {
        if (sk) {
          str += th[(x-i-1)/3] + ' ';
        }
        sk=0;
      }
    }

    if (x !== s.length) {
      let y = s.length;
      str += 'point ';
      for (let i=x+1; i<y; i++) {
        str += dg[n[i]] +' ';
      }
    }

    return str.replace(/\s+/g,' ');
  }

  renderRevision(revision: any, type: string) {
    let modelArray = revision.model.split(".");
    let output: Array<string> = [];
    switch (modelArray[0]) {
      case "market":
        if (modelArray.length >= 1) {
            output.push(this.convertToWords(modelArray[0] + "." + modelArray[1]) + ": " +
                this.formatFlipPriceType(revision.value));
        }
        break;
      case "purchaseClosingCost":
        output.push(this.convertToWords(modelArray[0]));
        if (modelArray.length >= 1) {
          output.push(this.convertToWords(modelArray[1]) + ": Cash $" +
            numeral((<Array<number>>revision.value)[0]).format("0,0") +
            " / Financed $" + numeral((<Array<number>>revision.value)[1]).format("0,0"));
        }
        break;
      case "sellingClosingCost":
        output.push(this.convertToWords(modelArray[0]));
        if (modelArray.length >= 1) {
          output.push(this.convertToWords(modelArray[1]) + ": $" +
            numeral(revision.value).format("0,0"));
        }
        break;
      case "repairAndRemodel":
        console.warn('repairAndRemodel revisions NYI');
/*        output.push(this.convertToWords(modelArray[0]));
        if (modelArray.length >= 2) {
          output.push(this.convertToWords(modelArray[1]));
          switch (modelArray[2]) {
            case 'roof':
            case 'hardFloorSurface':
              if ((modelArray.length >= 3) && ("type" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    this.convertToWords(String(revision.value)));
              }
              if ((modelArray.length >= 3) && ("cost" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    "$" + numeral(revision.value).format("0,0"));
              }
              break;
            case 'kitchenAppliancesSelected':
              output.push(this.convertToWords(modelArray[2]) + ": " +
                this.convertToWords((<Array<string>>revision.value).join(", ")));
              break;
            case 'paint':
              if ((modelArray.length >= 3) && ("type" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    String(revision.value));
              }
              if ((modelArray.length >= 3) && ("cost" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    this.formatPerSF(revision.value));
              }
              break;
            case 'carpetedSurface':
              if ((modelArray.length >= 3) && ("type" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    String(revision.value));
              }
              if ((modelArray.length >= 3) && ("cost" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    this.formatPerSY(revision.value));
              }
              break;
            case 'hvac':
              if ((modelArray.length >= 3) && ("type" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    String(revision.value));
              }
              if ((modelArray.length >= 3) && ("costPerTon" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    "$" + numeral(revision.value).format("0,0"));
              }
              if ((modelArray.length >= 3) && ("tons" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    this.formatPerTon(revision.value));
              }
              break;
            case 'windows':
            case 'hotWaterHeater':
              if ((modelArray.length >= 3) && ("count" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    this.formatPcs(revision.value));
              }
              if ((modelArray.length >= 3) && ("cost" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    "$" + numeral(revision.value).format("0,0"));
              }
              break;
            case 'interiorDoor':
            case 'lightFixture':
              if ((modelArray.length >= 3) && ("count" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    this.formatPcs(revision.value));
              }
              if ((modelArray.length >= 3) && ("costPerUnit" === modelArray[3])) {
                  output.push(this.convertToWords(modelArray[2] + "." + modelArray[3]) + ": " +
                    "$" + numeral(revision.value).format("0,0"));
              }
              break;
            case 'nonPaintSurfacesCost':
            case 'landscaping':
            case 'hardFloorSurfaceOptionRepairValue':
            case 'miscCarpentry': // TODO?
            case 'plumbing':
            case 'electrical':
            case 'other':
              output.push(this.convertToWords(modelArray[2]) + ": $" +
                numeral(revision.value).format("0,0"));
              break;
            default:
              output.push(this.convertToWords(modelArray[2]) + ": " +
                numeral(revision.value).format("0,0"));
              break;
          }
        }*/
        break;
      case "expenses":
        if (modelArray.length >= 1) {
          switch (modelArray[1]) {
            case "utilityCosts":
              if (modelArray.length >= 2) {
                output.push(this.convertToWords(modelArray[1]));
                output.push(this.convertToWords(modelArray[2]) + ": $" +
                  numeral(revision.value).format("0,0") + " total");
              }
              break;
            default:
              output.push(this.convertToWords(modelArray[1]) + ": $" +
                numeral(revision.value).format("0,0") + " total");
              break;
          }
        }
        break;
      default:
        output.push(this.convertToWords(modelArray[0]) + ": " +
            String(revision.value).toUpperCase());
        break;
    }
    return output.join(", ");
  }

  revertRevision(revision: any, type: string, errorHandler) {
    // TODO
  }

  initSliders(ninjaId, thumbnailId, index = 0) {
    let nsOptions: any = {
      sliderId: ninjaId,
      license: "b2o481"
    };
    let thumbnailSliderOptions: any = {
      sliderId: thumbnailId,
      license: "b2o481"
    };
    let ninjaSlider, thumbSlider;
    Object.assign(nsOptions, this.ninjaSliderBaseOptions);
    Object.assign(thumbnailSliderOptions, this.thumbnailSliderBaseOptions);
    nsOptions.startSlideIndex = index;
    nsOptions.before = (currentIdx, nextIdx, manual) => {
      if (manual && (typeof thumbSlider !== "undefined")) {
        thumbSlider.display(nextIdx);
      }
    };
    thumbnailSliderOptions.startSlideIndex = index;
    thumbnailSliderOptions.before = (currentIdx, nextIdx, manual) => {
      if (typeof ninjaSlider !== "undefined") {
        ninjaSlider.displaySlide(nextIdx);
      }
    };
    try {
      ninjaSlider = new NinjaSlider(nsOptions);
    } catch (e) {
      console.log('Failed to init NinjaSlider', e);
      return null;
    }
    thumbSlider = new ThumbnailSlider(thumbnailSliderOptions);
    return {
      ninjaSlider: ninjaSlider,
      thumbSlider: thumbSlider
    };
  }
}
