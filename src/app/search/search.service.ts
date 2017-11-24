import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { CompleterService, CompleterData } from '../ng2-completer/ng2-completer';
import { FieldSourceData } from '../ui/field-source-data';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { environment } from '../environment';
import { AuthService } from '../auth/auth.service';
import { SearchModel } from './search.model';
import * as moment from 'moment/moment';
declare let numeral:any;

export class Base64 {
  static _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  static encode(e) {var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t};
  static decode(e) {var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t};
  static _utf8_encode(e) {e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t};
  static _utf8_decode(e) {var t="";var n=0;var r=0,c1=0,c2=0,c3=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t};
};

function objectEquals(a, b)
{
  let p;
  for(p in a) {
      if(typeof(b[p])=='undefined') {return false;}
  }

  for(p in a) {
      if (a[p]) {
          switch(typeof(a[p])) {
              case 'object':
                  if (!objectEquals(a[p], b[p])) { return false; } break;
              case 'function':
                  if ((typeof(b[p])=='undefined') ||
                      (p != 'equals' && a[p].toString() != b[p].toString()))
                      return false;
                  break;
              default:
                  if (a[p] != b[p]) { return false; }
          }
      } else {
          if (b[p])
              return false;
      }
  }

  for(p in b) {
      if(typeof(a[p])=='undefined') {return false;}
  }

  return true;
}

export class SelectOption {
    value: string;
    label: string;
}

export class StatusSelectOption {
    value: string;
    statusShortValue: string;
    retsShortValue: string;
    label: string;
}

export class TypeSelectOption {
    value: string;
    retsShortValue: string;
    label: string;
}

export class SubTypeSelectOption {
    value: string;
    shortValue: string;
    retsShortValue: string;
    type: string;
    label: string;
}

export class NumericSelectOption {
    value: number;
    label: string;
}

export class DomRange {
    from: number;
    to: number;
}

@Injectable()
export class SearchService {
  authService: AuthService;
  search: SearchModel;
  renderedSearch: Array<any>;
  meta: any;
  watchlistMeta: any;
  properties: Array<any>;
  savedSearch: any;
  savedProperties: Array<any>;
  savedProperty: any;
  savedPropertyID: string;
  watchlistArray: Array<string>;
  watchlistProperties: Array<any>;
  ignorelistArray: Array<string>;
  newProperties: Array<any>;
  auctionMeta: Array<any> = [];
  currentSimpleSearch: string;
  currentAdvancedSearch: any;
  searchMetadata: any;
  fetchSearchMetadata: boolean;
  mlsStatuses: Array<StatusSelectOption> = [];
  propertyTypes: Array<TypeSelectOption> = [];
  propertySearchTypes: Array<TypeSelectOption> = [];
  propertySubTypes: Array<SubTypeSelectOption> = [];
  schoolDistricts: Array<SelectOption> = [];
  lotSizeAcreage: Array<SelectOption> = [];
  counties: Array<SelectOption> = [];
  cities: Array<SelectOption> = [];
  stories: Array<NumericSelectOption> = [];
  conditions: Array<SelectOption> = [];
  domranges: Array<DomRange> = [];
  countiesDataService: FieldSourceData;
  citiesDataService: FieldSourceData;
  schoolDistrictsDataService: FieldSourceData;
  page: number;
  size: number;
  sortBy: string;
  sortDir: string;
  searchName: string;
  watchlistPage: number;
  isProcessing: boolean = false;
  searchPending: boolean = false;

  constructor(private _http: Http,
    authService: AuthService,
    private completerService: CompleterService) {
    console.log("Init!");
    this.authService = authService;
    this.properties = [];
    this.savedProperties = [];
    this.savedProperty = {};
    this.savedPropertyID = null;
    this.watchlistArray = [];
    this.watchlistProperties = [];
    this.ignorelistArray = [];
    this.meta = {
        numberofElements: 0,
        totalElements: 0
    };
    this.watchlistMeta = {
        numberofElements: 0,
        totalElements: 0
    };
    this.fetchSearchMetadata = false;
    this.currentSimpleSearch = null;
    this.currentAdvancedSearch = null;
    this.savedSearch = {};
    this.page = 0;
    this.size = 20;
    this.watchlistPage = 0;
    this.search = new SearchModel();
    this.renderedSearch = [];
    this.resetSearch();
    this.countiesDataService = new FieldSourceData("counties", this);
    this.countiesDataService
        .searchFieldss("value")
        .titleField("label");
    this.citiesDataService = new FieldSourceData("cities", this);
    this.citiesDataService
        .searchFieldss("value")
        .titleField("label");
    this.schoolDistrictsDataService = new FieldSourceData("schoolDistricts", this);
    this.schoolDistrictsDataService
        .searchFieldss("value")
        .titleField("label");
  }

  resetSearch() {
    this.properties.length = 0;
    this.meta = {};

    this.search.reset();
    this.search.page = 1;
    this.search.size = 20;
    this.search.mlsStatus = [""];
    this.search.propertyType = [""];
    this.search.propertySubType = [""];
    this.search.schoolDistrict = [""];
    this.renderedSearch = [];
  }

  getSearchMetadata(errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    if (!this.fetchSearchMetadata) {
      this.fetchSearchMetadata = true;
      return this._http.get(environment.API_ENDPOINT + 'search/metadata', {headers: headers})
        .subscribe(
          res => {
            let data:any = res.json();
            this.searchMetadata = data;
            this.mlsStatuses = [];
            let statusConversion = {
              "Active Option Contract": "Option",
              "Active Contingent": "Contingent",
              "Active Kick out": "Kickout"
            };
            for (let x of this.searchMetadata.mlsStatuses) {
              let label = ("undefined" !== typeof statusConversion[x.value]) ?
                statusConversion[x.value] : x.value;
              this.mlsStatuses.push({
                "value": x.value,
                "retsShortValue": x.retsShortValue,
                "statusShortValue": x.statusShortValue,
                "label": label
              });
            }
            this.propertyTypes = [];
            for (let x of this.searchMetadata.propertyTypes) {
              this.propertyTypes.push({
                "value": x.value,
                "retsShortValue": x.retsShortValue,
                "label": x.value
              });
              if (-1 !== ["Residential", "Residential Lease"].indexOf(x.value)) {
                this.propertySearchTypes.push({
                  "value": x.value,
                  "retsShortValue": x.retsShortValue,
                  "label": x.value
                });
              }
            }
            this.propertySubTypes = [];
            for (let x of this.searchMetadata.propertySubTypes) {
              this.propertySubTypes.push({
                "value": x.value,
                "shortValue": x.shortValue,
                "retsShortValue": x.retsShortValue,
                "type": x.propertyType,
                "label": x.shortValue
              });
            }
            this.counties = [];
            for (let x of this.searchMetadata.counties) {
              this.counties.push({
                "value": x.value, "label": x.value
              });
            }
            this.cities = [];
            for (let x of this.searchMetadata.cities) {
              this.cities.push({
                "value": x.value, "label": x.value
              });
            }
            this.schoolDistricts = [];
            for (let x of this.searchMetadata.schoolSystems) {
              this.schoolDistricts.push({
                "value": x.value, "label": x.value
              });
            }
          },
          error => errorHandler,
          () => console.log(this.searchMetadata)
        );
    }
  }

  getMlsStatuses() {
    /*
    if (0 === this.mlsStatuses.length) {
      this.mlsStatuses = [
        {value: "ACTIVE", label: "Active"},
        {value: "ACTIVE_OPTION", label: "Active Option"},
        {value: "ACTIVE_KICK_OUT", label: "Active Kick Out"},
        {value: "ACTIVE_CONTINGENT_PENDING", label: "Active Contingent Pending"}
        // We should never allow searching for expired, canceled,
        // or temp off market properties
      ];
    }
    */
  }

  getSchoolDistricts() {
    /*
    this.schoolSystems = [
      {value: "ELEMENTARY", label: "Elementary School"},
      {value: "MIDDLE", label: "Middle School"},
      {value: "JUNIOR_HIGH", label: "Junior High"},
      {value: "HIGH", label: "High School"},
      {value: "SENIOR_HIGH", label: "Senior High School"}
    ];
    */
  }

  getCounties() {
    this.counties = [
      {value: "Dallas", label: "Dallas"},
      {value: "Collin", label: "Collin"},
      {value: "Denton", label: "Denton"},
      {value: "Tarrant", label: "Tarrant"}
    ];
  }

  getStories() {
    this.stories = [
      {value: 1, label: "Single Story"},
      {value: 2, label: "Two Story"}
    ];
  }

  getConditions() {
    this.conditions = [
      {value: "Excellent", label: "Excellent"},
      {value: "Good", label: "Good"},
      {value: "Average Good", label: "Average Good"},
      {value: "Average Fair", label: "Average Fair"},
      {value: "Fair", label: "Fair"},
      {value: "Poor", label: "Poor"}
    ];
  }

  getLotSizeAcreage() {
    this.lotSizeAcreage = [
      {value: "Less Than .5 Acre", label: "Less Then .5 Acre"},
      {value: ".5 Acre to .99 Acre", label: ".5 Acre to .99 Acre"},
      {value: "1 Acre to 2.99 Acres", label: "1 Acre to 2.99 Acres"},
      {value: "3 Acres to 4.99 Acres", label: "3 Acres to 4.99 Acres"},
      {value: "5 Acres to 9.99 Acres", label: "5 Acres to 9.99 Acres"},
      {value: "10 Acres to 49.99 Acres", label: "10 Acres to 49.99 Acres"},
      {value: "50 Acres to 99.99 Acres", label: "50 Acres to 99.99 Acres"},
      {value: "100+ Acres", label: "100+ Acres"},
      {value: "Condo/Townhome Lot", label: "Condo/Townhome Lot"},
      {value: "Zero Lot", label: "Zero Lot"}
    ];
  }

  getDomRanges() {
    this.domranges = [
      {from: 0, to: 6},
      {from: 7, to: 14},
      {from: 15, to: 29},
      {from: 30, to: 59},
      {from: 60, to: 119},
      {from: 120, to: 0}
    ];
  }

  toggleSearchMlsStatus(ms) {
    let pos = this.search.mlsStatus.indexOf(ms.value);
    if (-1 !== pos) {
      this.search.mlsStatus.splice(pos, 1);
    } else {
      this.search.mlsStatus.push(ms.value);
    }
  }

  hasSearchMlsStatus(ms) {
    return (-1 !== this.search.mlsStatus.indexOf(ms.value));
  }

  toggleSearchPropertyType(pt) {
    let pos = this.search.propertyType.indexOf(pt.value);
    if (-1 !== pos) {
      this.search.propertyType.splice(pos, 1);
      // TODO:  Remove subtypes that don't match
      // currently selected property types
    } else {
      this.search.propertyType.push(pt.value);
    }
  }

  hasSearchPropertyType(pt) {
    return (-1 !== this.search.propertyType.indexOf(pt.value));
  }

  toggleSearchPropertySubType(pt) {
    let pos = this.search.propertySubType.indexOf(pt.value);
    if (-1 !== pos) {
      this.search.propertySubType.splice(pos, 1);
    } else {
      this.search.propertySubType.push(pt.value);
    }
  }

  hasSearchPropertySubType(pt) {
    return (-1 !== this.search.propertySubType.indexOf(pt.value));
  }

  getSearchRange(field: string) {
    let range = "";
    let lookupFrom = field + "From";
    let lookupTo = field + "To";
    let rangeFrom = 0;
    let rangeTo = 0;
    let x: any;
    if ("undefined" !== typeof this.search[lookupFrom]) {
      rangeFrom = this.search[lookupFrom] || 0;
    }
    if ("undefined" !== typeof this.search[lookupTo]) {
      rangeTo = this.search[lookupTo] || 0;
    }
    for (x of this.domranges) {
      if ((rangeFrom === x.from) && (rangeTo === x.to)) {
        range = String(x.from) + ";" + String(x.to);
      }
    }
    return range;
  }

  setSearchRange(field: string, range: string) {
    if (!this.isProcessing) {
      let lookupFrom = field + "From";
      let lookupTo = field + "To";
      let ranges = range.split(";");
      this.isProcessing = true;

      if (2 === ranges.length) {
        this.search[lookupFrom] = parseInt(ranges[0]);
        if (!this.search[lookupFrom]) {
          this.search[lookupFrom] = null;
        }
        this.search[lookupTo] = parseInt(ranges[1]);
        if (!this.search[lookupTo]) {
          this.search[lookupTo] = null;
        }
      } else {
          this.search[lookupFrom] = null;
          this.search[lookupTo] = null;
      }
      setTimeout(() => {
        this.isProcessing = false;
      }, 10);
    }
  }

  getDate(dt: number) {
    return moment(dt).format('MMMM Do YYYY, h:mm:ss a');
  }

  getTimeAgo(dt: number) {
    return moment(dt).fromNow();
  }

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

  handleUpdateSearchSliderField(event, field, min, max, ref) {
    if (('undefined' !== typeof ref) && this.search[ref]) {
      let basePct = this.logInverseScaling(min, max, this.search[ref]);
      let convertedPct = (100 * (event.relativePercentHorisontal - basePct)) / (100 - basePct);
      this.search[field] = Math.round(this.logScaling(this.search[ref], max, convertedPct));
    } else {
      this.search[field] = Math.round(this.logScaling(min, max, event.relativePercentHorisontal));
    }
  }

  handleUpdateSearchLinearSliderField(event, field, min, max) {
    let diff = max - min;
    this.search[field] = min + Math.floor(diff * (event.relativePercentHorisontal / 100));
  }

  handleFixSearchSliderField(event, field, step) {
    this.search[field] = Math.round(this.search[field] / step) * step;
  }

  getSearchSliderFieldPct(field, min, max, def, ref) {
    if (('undefined' !== typeof ref) && this.search[ref]) {
      let basePct = this.logInverseScaling(min, max, this.search[ref]);
      let unscaledPct = this.logInverseScaling(this.search[ref], max, this.search[field] || def);
      let scaledPct = unscaledPct * (100 - basePct) / 100;
      return String(basePct + scaledPct) + "%";
    } else {
      return String(this.logInverseScaling(min, max, this.search[field] || def)) + "%";
    }
  }

  renderSearch() {
    let x: string;
    let camelCaseTerm: string;
    let sortTerm: string;
    this.renderedSearch = [];
    if ("undefined" !== typeof this.search) {
      for (x in this.search) {
        camelCaseTerm = this.unCamelCase(x);
        sortTerm = camelCaseTerm;
        switch (x) {
          case "listPriceFrom":
          case "listPriceTo":
          case "priceRangeFrom":
          case "priceRangeTo":
          case "hitArvFrom":
          case "hitArvTo":
          case "hitAsIsFrom":
          case "hitAsIsTo":
          case "hitRentFrom":
          case "hitRentTo":
          case "hitWholesaleFrom":
          case "hitWholesaleTo":
            if (!this.search[x]) {
              break;
            }
            if (-1 !== ["listPriceFrom", "listPriceTo"].indexOf(x)) {
              sortTerm = "_" + camelCaseTerm;
            }
            this.renderedSearch.push({
              term: camelCaseTerm,
              sortTerm: sortTerm,
              value: "$" + numeral(this.search[x]).format('0,0')
            });
            break;
          case "searchName":
          case "searchid":
          case "page":
          case "size":
            break;
          default:
            if (("undefined" === typeof this.search[x]) ||
                !this.search[x] ||
                ("" === this.search[x]) ||
                (("object" === typeof this.search[x]) &&
                    (1 === this.search[x].length) &&
                    ("" === this.search[x][0]))) {
              break;
            }
            if ("mlsStatus" === x) {
              sortTerm = "_____" + camelCaseTerm;
            }
            if ("propertyType" === x) {
              sortTerm = "____" + camelCaseTerm;
            }
            if ("propertySubType" === x) {
              sortTerm = "___" + camelCaseTerm;
            }
            if (-1 !== ["mlsStatus", "propertyType", "propertySubType", "schoolDistrict"].indexOf(x)) {
                this.renderedSearch.push({
                    term: camelCaseTerm,
                    sortTerm: sortTerm,
                    value: this.search[x].filter(v => ("" !== v)).join(", ")
                });
            } else {
                this.renderedSearch.push({
                    term: camelCaseTerm,
                    sortTerm: sortTerm,
                    value: this.search[x]
                });
            }
            break;
        }
      }
      this.renderedSearch.sort((a,b) => {
        return a.sortTerm.localeCompare(b.sortTerm);
      });
    }
  }

  setProperties(p) {
    // TODO: figure out caching later
    /*
    let start = this.page * this.size,
      propertyLength = start + p.length,
      i;
    if (this.properties.length < propertyLength) {
      for (i=this.properties.length; i<propertyLength; i++) {
        this.properties.push({
          "address": {},
          "building": {
            "rooms": {}
          }
        });
      }
    }
    for (i=start; i<propertyLength; i++) {
      this.properties[i] = p[i-start];
    }
    */
    if (("undefined" !== typeof this.properties) || !this.properties) {
      this.properties = [];
    }
    this.properties.length = 0;
    for (let i=0; i<p.length; i++) {
      this.properties.push(p[i]);
    }
  }

  setSavedProperties(p) {
    // TODO: figure out caching later
    /*
    let start = this.page * this.size,
      propertyLength = start + p.length,
      i;
    if (this.savedProperties.length < propertyLength) {
      for (i=this.savedProperties.length; i<propertyLength; i++) {
        this.savedProperties.push({});
      }
    }
    for (i=start; i<propertyLength; i++) {
      this.savedProperties[i] = p[i-start];
    }
    */
    this.savedProperties.length = 0;
    for (let i=0; i<p.length; i++) {
      p[i].metas = this.getSavedSearchMetas(p[i].searchFilter);
      this.savedProperties.push(p[i]);
    }
  }

  getSavedSearchMetas(searchFilter) {
    var metas: Array<any> = [];
    let status: Array<string> = [];
    let location: Array<string> = [];
    let priceRange: Array<string> = [];

    for (let x in searchFilter) {
      if (("undefined" !== typeof searchFilter[x]) && (null !== searchFilter[x])) {
        switch (x) {
          case "mlsStatus":
            status.push(searchFilter[x].filter((item) => "" !== item).join(", "));
            break;
          case "propertyType":
            let propertyTypeArray = [];
            for (let propertyType of this.propertyTypes) {
              if (-1 !== searchFilter[x].indexOf(propertyType.value)) {
                let propertySubTypeArray = [];
                for (let propertySubType of this.propertySubTypes) {
                  if ((propertySubType.type === propertyType.value) &&
                      (-1 !== searchFilter["propertySubType"].indexOf(propertySubType.value))) {
                      propertySubTypeArray.push(propertySubType.value);
                  }
                }
                if (propertySubTypeArray.length > 0) {
                  propertyTypeArray.push(propertyType.value + " (" + propertySubTypeArray.join(", ") + ")");
                } else {
                  propertyTypeArray.push(propertyType.value);
                }
              }
              status.push(propertyTypeArray.join(", "));
            }
            break;
          case "county":
            location.push(searchFilter[x] + " County");
            break;
          case "city":
            location.push(searchFilter[x]);
            break;
          case "zipcodes":
            location.push(searchFilter[x].join(", "));
            break;
          case "priceRangeFrom":
            priceRange.push("from <strong>$" + numeral(searchFilter[x]).format('0,0') + "</strong>");
            break;
          case "priceRangeTo":
            priceRange.push("to <strong>$" + numeral(searchFilter[x]).format('0,0') + "</strong>");
            break;
        }
      }
    }

    if (status.length) {
      metas.push({
        class: "status",
        content: status.join(" / ")
      });
    }

    if (location.length) {
      metas.push({
        class: "location",
        content: location.join(" / ")
      });
    }

    if (priceRange.length) {
      metas.push({
        class: "pricerange",
        content: priceRange.join(" ")
      });
    }

    return metas;
  }

  getFirstPhoto(property) {
    if (property && ("undefined" !== typeof property.bippoProperty)) {
      property = property.bippoProperty;
    }
    return (("undefined" !== typeof property.resources)
            && (null !== property.resources)
            && ("undefined" !== typeof property.resources.photos)
            && (null !== property.resources.photos)
            && (property.resources.photos.urls.length > 0)) ?
        property.resources.photos.urls[0] : null;
  }

  getSimpleSearch(query, page, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    if (this.currentSimpleSearch !== query) {
      this.currentSimpleSearch = query;
      this.currentAdvancedSearch = null;
      this.properties.length = 0;
    }
    this.page = ("undefined" !== typeof page) ? page - 1 : 0;
    if (this.page < 0) {
      this.page = 0;
    }
    this.searchPending = true;
    return this._http.get(environment.API_ENDPOINT + 'search/simple?address='+
        query+'&page='+String(this.page)+'&size='+String(this.size), {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          if (("undefined" !== typeof data["content"]) && data["content"]) {
            this.setProperties(data["content"]);
            Object.assign(this.meta, data);
            delete this.meta.content;
          } else {
            this.setProperties([]);
          }
        },
        error => errorHandler,
        () => {
          console.log("simple search", this.properties);
          this.searchPending = false;
        }
      );
  }

  getAuctionSearch(query, page, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});

    this.page = ("undefined" !== typeof page) ? page - 1 : 0;

    if (this.page < 0) {
      this.page = 0;
    }

    this.searchPending = true;

    return this._http.get(environment.API_ENDPOINT + 'search/auctions?' + query + '&page=' + String(this.page) + '&size=' + String(this.size), { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();

          if (("undefined" !== typeof data["content"]) && data["content"]) {
            this.setProperties(data["content"]);
            Object.assign(this.meta, data);
            delete this.meta.content;
          } else {
            this.setProperties([]);
          }
        },
        error => errorHandler,
        () => {
          console.log("auction search", this.properties);
          this.searchPending = false;
        }
      );
  }

/*  getAuctionCountyMonth(county, minTime, maxTime, page, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});

    this.page = ("undefined" !== typeof page) ? page - 1 : 0;

    if (this.page < 0) {
      this.page = 0;
    }

    return this._http.get(environment.API_ENDPOINT + 'search/auctions?county=' + county + '&minTime' + minTime
        + '&maxTime=' + maxTime + '&page=' + String(this.page) + '&size=' + String(this.size), { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();

          if (("undefined" !== typeof data["content"]) && data["content"]) {
            this.setProperties(data["content"]);
            Object.assign(this.meta, data);
            delete this.meta.content;
          } else {
            this.setProperties([]);
          }
        },
        error => errorHandler,
        () => console.log("auction search", this.properties)
      );
  }*/

  setAdvanceSearchQuery(query) {
    // Do this so we can filter out fields we don't
    // need to search on
    let data = {};
    this.size = 20;
    this.page = 0;
    this.searchName = "";

    for (let x in query) {
      if (("undefined" !== typeof query[x]) && (null !== query[x])) {
        if (-1 !== ["searchName", "page", "size"].indexOf(x)) {
          if ("page" == x) {
            this[x] = query[x] - 1;
            if (this[x] < 0) {
              this[x] = 0;
            }
          } else {
            this[x] = query[x];
          }
        } else if ("searchid" !== x) {
          switch (typeof query[x]) {
            case "number":
              if (query[x] > 0) {
                data[x] = query[x];
              }
              break;
            case "boolean":
              if (query[x]) {
                data[x] = query[x];
              }
              break;
            case "string":
              if (query[x].length > 0) {
                data[x] = query[x];
              }
              break;
            case "object":
              if ((query[x].length > 0) && ((1 !== query[x].length) || ("" !== query[x][0]))) {
                data[x] = query[x].slice(0);
                let pos = data[x].indexOf("");
                if (-1 !== pos) {
                  data[x].splice(pos, 1);
                }
              }
              break;
          }
        }
      }
    }
    for (let field of ["mlsStatus", "propertyType", "propertySubType", "schoolDistrict"]) {
      if (!data[field]) {
        data[field] = [""];
      }
    }

    if (!this.currentAdvancedSearch || !objectEquals(data, this.currentAdvancedSearch)) {
      this.currentAdvancedSearch = data;
      this.currentSimpleSearch = null;
      this.properties.length = 0;
    }
  }

  getAdvanceSearchPage(query, usePage, errorHandler) {
    this.setAdvanceSearchQuery(query);
    this.renderSearch();
    let headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.getToken()
    });
    let options = new RequestOptions({ headers: headers });
    let url = environment.API_ENDPOINT + 'search/advanced?page='+
        usePage+'&size='+String(this.size)+'&searchName='+
        String(this.searchName);

    if ("undefined" !== typeof this.sortBy) {
      url += '&sort=' + encodeURIComponent(this.sortDir + this.sortBy);
    }

    this.searchPending = true;

    return this._http.post(url, JSON.stringify(this.currentAdvancedSearch), options)
      .subscribe(
        res => {
          let data:any = res.json();
          if (("undefined" !== typeof data["content"]) && data["content"]) {
              this.setProperties(data["content"]);
              Object.assign(this.meta, data);
              delete this.meta.content;
              return data;
          } else {
              this.setProperties([]);
              return {};
          }
        },
        error => console.log(error),
        () => {
          console.log(this.properties);
          this.searchPending = false;
        }
      );
  }

  getAdvanceSearch(query, errorHandler) {
    this.setAdvanceSearchQuery(query);
    this.renderSearch();
    let headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.getToken()
    });
    let options = new RequestOptions({ headers: headers });
    let url = environment.API_ENDPOINT + 'search/advanced?page='+
        String(this.page)+'&size='+String(this.size)+'&searchName='+
        String(this.searchName);

    if ("undefined" !== typeof this.sortBy) {
      url += '&sort=' + encodeURIComponent(this.sortDir + this.sortBy);
    }

    this.searchPending = true;

    return this._http.post(url, JSON.stringify(this.currentAdvancedSearch), options)
      .subscribe(
        res => {
          let data:any = res.json();
          if (("undefined" !== typeof data["content"]) && data["content"]) {
              this.setProperties(data["content"]);
              Object.assign(this.meta, data);
              delete this.meta.content;
              return data;
          } else {
              this.setProperties([]);
              return {};
          }
        },
        error => console.log(error),
        () => {
          console.log(this.properties);
          this.searchPending = false;
        }
      );
  }

  getSavedSearches(page, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    this.currentAdvancedSearch = null;
    this.currentSimpleSearch = null;
    this.page = ("undefined" !== typeof page) ? page - 1 : 0;
    if (this.page < 0) {
      this.page = 0;
    }
    return this._http.get(environment.API_ENDPOINT + 'saved_search?page='+
        String(this.page)+'&size='+String(this.size), {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          this.setSavedProperties(data["content"]);
          Object.assign(this.savedSearch, data);
          delete this.savedSearch.content;
        },
        error => errorHandler,
        () => console.log(this.savedProperties)
      );
  }

  getSavedSearchPage(id: string, usePage, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'saved_search/id/'+id, {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          let query: any = {};
          Object.assign(query, data.searchFilter);
          query.searchName = data.searchName;
          query.searchid = data.id;
          this.savedProperty = data;
          this.savedPropertyID = String(data.id);
          this.search.update(query);
          console.log(this.search);
          this.getAdvanceSearchPage(this.savedProperty.searchFilter, usePage, errorHandler);
        },
        error => errorHandler,
        () => console.log(this.savedProperty)
      );
  }

  getSavedSearch(id: string, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'saved_search/id/'+id, {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          let query: any = {};
          Object.assign(query, data.searchFilter);
          query.searchName = data.searchName;
          query.searchid = data.id;
          this.savedProperty = data;
          this.savedPropertyID = String(data.id);
          this.search.update(query);
          console.log(this.search);
          this.getAdvanceSearch(this.savedProperty.searchFilter, errorHandler);
        },
        error => errorHandler,
        () => console.log(this.savedProperty)
      );
  }

  createUpdateSavedSearch(errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    let options = new RequestOptions({ headers: headers });
    let method = "post";
    let url = environment.API_ENDPOINT + 'saved_search/id';
    if (null !== this.savedPropertyID) {
      method = "put";
      url = url + "/" + this.savedPropertyID;
    } else {
      this.savedProperty = {};
      for (let x in this.currentAdvancedSearch) {
        if (-1 !== ["searchName", "searchid", "page", "size"].indexOf(x)) {
          this.savedProperty[x] = this.currentAdvancedSearch[x];
        }
      }
    }
    return this._http[method](url, options)
      .subscribe(
        res => {
          let data:any = res.json();
          this.savedProperty = data;
          this.savedPropertyID = String(data.id);
        },
        error => errorHandler,
        () => console.log(this.savedProperty)
      );
  }

  deleteSavedSearch(id: number, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    let options = new RequestOptions({ headers: headers });
    return this._http.delete(environment.API_ENDPOINT + 'saved_search/id/' + id, options)
      .subscribe(
        res => {
          let data:any = res.json();
          let page = this.page;
          if (this.meta.totalElements <= (page - 1) * this.size) {
            page--;
          }
          if (page < 1) {
            page = 0;
          }
          if (page > 0) {
            return this.getSavedSearches(this.page, errorHandler);
          } else {
            this.savedProperties = [];
            this.savedSearch = {};
          }
        },
        error => errorHandler,
        () => console.log(this.savedProperties)
      );
  }

  getFullWatchlistProperties(errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'watchlist/full?page='+
        String(this.watchlistPage)+'&size='+String(this.size), {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          Object.assign(this.watchlistMeta, data);
          delete this.watchlistMeta.content;
          this.watchlistProperties = data.content;
          return data;
        },
        error => errorHandler,
        () => console.log(this.watchlistProperties)
      );
  }

  getWatchlistProperties(errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'watchlist/?page=0&size=9999', {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          this.watchlistArray = data.content;
        },
        error => errorHandler,
        () => console.log(this.watchlistArray)
      );
  }

  getWatchlistProperty(property) {
    if ("undefined" !== typeof property.bippoProperty) {
      return property.bippoProperty;
    }
    return property;
  }

  toggleWatchlistSearchListing(prop: any, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    let options = new RequestOptions({ headers: headers });
    let id: string;
    if ("string" !== typeof prop) {
      id = <any>prop.identifier.bippoId;
    } else {
      id = <string>prop;
    }
    let pos = this.watchlistArray.indexOf(id);
    if (-1 !== pos) {
      this.watchlistArray.splice(pos, 1);
      for (pos=0; pos<this.watchlistProperties.length; pos++) {
        if (id === this.watchlistProperties[pos].bippoProperty.identifier.bippoId) {
          this.watchlistProperties.splice(pos, 1);
          this.watchlistArray.splice(pos, 1);
          break;
        }
      }
    } else {
      this.watchlistArray.push(id);
      if ("string" !== typeof prop) {
        this.watchlistProperties.push(prop);
      }
    }
    return this._http.post(environment.API_ENDPOINT + 'watchlist/property/' + encodeURIComponent(id), "", options)
      .map(res => res.json())
      .subscribe(
        data => {
          // this.watchlistArray = data;
        },
        error => errorHandler,
        () => console.log(this.watchlistArray)
      );
  }

  inWatchlist(id: string) {
    return (-1 !== this.watchlistArray.indexOf(id));
  }

  getIgnoredListings(errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'ignorelist/all', {headers: headers})
      .subscribe(
        res => {
          this.ignorelistArray = res.json();
        },
        error => errorHandler
      );
  }

  inIgnorelist(id: string) {
    return (-1 !== this.ignorelistArray.indexOf(id));
  }

  ignoreSearchListing(id: string, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    let ignorePos: number = this.ignorelistArray.indexOf(id);
    if (-1 != ignorePos) {
      this.ignorelistArray.splice(ignorePos, 1);
      return this._http.delete(environment.API_ENDPOINT +
          'ignorelist/'+encodeURIComponent(id), {headers: headers})
        .subscribe(
          res => {
              // Do nothing
          },
          error => errorHandler
        );
    } else {
      this.ignorelistArray.push(id);
      let options = new RequestOptions({ headers: headers });
      return this._http.put(environment.API_ENDPOINT +
          'ignorelist/'+encodeURIComponent(id), "", options)
        .subscribe(
          res => {
              // Do nothing
          },
          error => errorHandler
        );
    }
  }

  getNewProperties(errorHandler) {
    let headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.getToken()
    });
    let options = new RequestOptions({ headers: headers });
    let newListingsSearch = {
      "mlsStatus": ["Active"],
      "propertyType": ["Residential"],
      "statusChangeTimestampFrom": moment().subtract(1, 'days').toISOString()
    };

    return this._http.post(environment.API_ENDPOINT + 'search/advanced?page=1&size=20',
      JSON.stringify(newListingsSearch), options)
      .subscribe(
        res => {
          let data:any = res.json();
          this.newProperties = data["content"];
          return data;
        },
        error => console.log(error),
        () => console.log("new properties", this.newProperties)
      );
  }

  getAuctionMetadata(count) {
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.authService.getToken() });

    return this._http.get(environment.API_ENDPOINT + 'search/metadata/auctions?count=' + count, { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();

          if (data["groups"]) {
            this.auctionMeta = data["groups"];
          } else {
            console.log("bad auction metadata response", data);
          }

          return data;
        },
        error => console.log(error),
        () => console.log("auction meta", this.auctionMeta)
      );
  }

  getPropertyId(property: any) {
    let parsedProperty = [];
    if (property) {
      if ("undefined" !== typeof property.bippoProperty) {
        property = property.bippoProperty;
      }
      if (("undefined" !== typeof property["hitMergedResponse"]) &&
        property["hitMergedResponse"]) {
        property = property["hitMergedResponse"];
      }
      if (("undefined" !== typeof property["identifier"]) &&
          property["identifier"] &&
          ("undefined" !== typeof property["identifier"]["mlsNumber"]) &&
          property["identifier"]["mlsNumber"]) {
        parsedProperty.push("mlsNumber:" + String(property["identifier"]["mlsNumber"]));
      } else if (("undefined" !== typeof property["identifier"]) &&
          property["identifier"] &&
          ("undefined" !== typeof property["identifier"]["obPropId"]) &&
          property["identifier"]["obPropId"]) {
        parsedProperty.push("obPropId:" + String(property["identifier"]["obPropId"]));
      } else {
          parsedProperty.push(String(property["identifier"]["bippoId"]));
      }

      return encodeURIComponent(parsedProperty.join("-"));
    } else {
      return "";
    }
  }

  unCamelCase(term: string) {
    let result = term.replace(/([A-Z])/g, ' $1');
    return result.substr(0, 1).toUpperCase() + result.substr(1);
  }
}
