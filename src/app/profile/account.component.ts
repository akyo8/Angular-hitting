import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-profile-account',
  templateUrl: 'account.component.html',
  styleUrls: []
})
export class AccountComponent implements OnInit {
  authService: AuthService;

  constructor(
    private router: Router,
    authService: AuthService
  ) {
    this.authService = authService;
    console.log("Init account component!");
  }

  ngOnInit() {
    this.authService.getAccountData((error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      return caught;
    });
  }

  onSubmit() {
    // TODO
  }
}
