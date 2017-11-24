import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { environment } from '../environment';

@Component({
  moduleId: module.id,
  selector: 'app-subscribe',
  templateUrl: 'subscribe.component.html',
  styleUrls: ['subscribe.component.css']
})
export class SubscribeComponent implements OnInit {
  ngZone: NgZone;
  authService: AuthService;
  stripeToken: any;
  newSubscriber: boolean = true;
  formatError: boolean = false;
  paymentError: boolean = false;

  constructor(
    private router: Router,
    ngZone: NgZone,
    authService: AuthService
  ) {
    this.ngZone = ngZone;
    this.authService = authService;
    this.stripeToken = {};
    console.log("Init subscribe component!");
  }

  ngOnInit() {
  }

  onSubmit() {
    (<any>window).Stripe.setPublishableKey(environment.STRIPE_PUB_KEY);
    (<any>window).Stripe.card.createToken(this.stripeToken, (status: number, response: any) => {
      if (status === 200) {
        this.ngZone.run(() => {
           this.formatError = false;
           this.paymentError = false;
        });
        this.authService.handleSubscribe(response.id, () => {
          this.ngZone.run(() => { this.router.navigate(['/']); });
        }, () => {
          this.paymentError = true;
        });
      } else {
        this.ngZone.run(() => {
          this.formatError = true;
          this.paymentError = false;
        });
      }
    });
/*
    this.authService.handleLogin(() => {
      this.showError = false;
      this.showUnconfirmedError = false;
      this.showUnconfirmedMessage = false;
      this.router.navigate(['/']);
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
    }); */
  }
}
