import { Injectable } from '@angular/core';
import {  Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppSettings } from '../app-settings';

@Injectable()
export class SimpleSearchService {
  constructor(private _http: Http) { }
  getSimpleSearch(query) {

    return this._http.get(`${AppSettings.API_ENDPOINT}search/simple?address=`+query)
      .map(res => res.json());
  }
}
