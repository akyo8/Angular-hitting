import { Injectable, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { environment } from '../environment';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment/moment';

@Injectable()
export class NotesService {
  ngZone: NgZone;
  authService: AuthService;
  notes: Array<any>;
  notesMeta: any;
  newnote: string;
  page: number;
  size: number;
  photoAddendum: Array<any>;

  constructor(private _http: Http, ngZone: NgZone, authService: AuthService) {
    console.log("Init notes service!");
    this.ngZone = ngZone;
    this.authService = authService;
    this.notes = [];
    this.newnote = "";
    this.size = 20;
    this.page = 0;
    this.photoAddendum = null;
  }

  getPropertyNotes(id, errorHandler) {
    let headers = new Headers({"Authorization": "Bearer " + this.authService.getToken()});
    return this._http.get(environment.API_ENDPOINT + 'property/' +
        encodeURIComponent(id) + '/notes', {headers: headers})
      .subscribe(
        res => {
          let data:any = res.json();
          this.notes = [];

          for (let note in data) {
              this.notes.push(data[note]);
          }

          this.notes.reverse();
//          this.notes = data["notes"];
          this.notesMeta = data;
//          delete this.notesMeta.notes;
          console.log("Setting property notes", this.notes);
        },
        error => errorHandler
      );
  }

  savePropertyNote(bippoId, errorHandler) {
    if ("" !== this.newnote) {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.authService.getToken()
        });
        let options = new RequestOptions({ headers: headers });
        let method = "post";
        let data = {
          content: this.newnote
        };
        return this._http[method](environment.API_ENDPOINT + 'property/' +
            encodeURIComponent(bippoId) + '/notes',
            JSON.stringify(data), options)
          .subscribe(
            res => {
                this.ngZone.run(() => {
                  this.notes.push({
                    'content': this.newnote,
                    'authorCode': 'user',
                    'created': new Date().getTime()
                  });
                  console.log('insert new note ' + this.newnote);
                  this.newnote = "";
                });
                return null;
            },
            error => errorHandler
          );
      }
  }

  getPhotoAddendum(bippoId, successHandler, errorHandler) {
    let headers = new Headers({ "Authorization": "Bearer " + this.authService.getToken() });
    return this._http.get(environment.API_ENDPOINT + 'notes/addendum/' + encodeURIComponent(bippoId), { headers: headers })
      .subscribe(
        res => {
          let data:any = res.json();

          if (data.photos) {
            this.photoAddendum = data.photos;
          } else {
            this.photoAddendum = null;
          }

          successHandler(this.photoAddendum);
        },
        error => errorHandler
      );
  }

  postPhotoAddendum(photoAddendumPayload, successHandler, errorHandler) {
    let headers = new Headers({
      "Authorization": "Bearer " + this.authService.getToken(),
      "Content-Type": "application/json"
    });
    this._http.post(environment.API_ENDPOINT + 'notes/addendum', JSON.stringify(photoAddendumPayload), { headers: headers })
      .subscribe(
        res => {
          if (res["status"] == 200) {
            successHandler();
          } else {
            errorHandler('Got status code ' + res["status"], null);
          }
        },
        error => errorHandler
      );
  }
}
