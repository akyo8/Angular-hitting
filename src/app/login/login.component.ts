import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {
  authService: AuthService;
  showError: boolean = false;
  showUnconfirmedError: boolean = false;
  showUnconfirmedMessage: boolean = false;

  constructor(
    private router: Router,
    authService: AuthService
  ) {
    this.authService = authService;
    console.log("Init login component!");
  }

  ngOnInit() {
  }

  onSubmit() {
    this.authService.handleLogin(() => {
      this.showError = false;
      this.showUnconfirmedError = false;
      this.showUnconfirmedMessage = false;

      if (this.authService.isSubscribed()) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/subscribe']);
      }
    }, (error: any, caught: Observable<any> = undefined) => {
      if (("string" === typeof error) && ("unconfirmed" === (<string>error))) {
        this.showUnconfirmedError = true;
        this.showUnconfirmedMessage = false;
        return caught;
      } else {
        console.log(error);
        this.showError = true;
        return caught;
      }
    });
  }

  resendConfirm() {
    this.authService.handleResendConfirmation(() => {
      this.showError = false;
      this.showUnconfirmedError = false;
      this.showUnconfirmedMessage = true;
    }, (error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      this.showError = true;
      return caught;
    });
  }
}
