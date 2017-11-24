import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-verify',
  templateUrl: 'verify.component.html',
  styleUrls: ['register.component.css']
})
export class VerifyComponent implements OnInit {
  authService: AuthService;
  showDuplicate: boolean = false;
  showError: boolean = false;
  showSuccess: boolean = false;
  showPending: boolean = false;
  zone: NgZone;
  private sub: any;
  code: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    ngZone: NgZone,
    authService: AuthService
  ) {
    this.zone = ngZone;
    this.authService = authService;
    console.log("Init register component!");
  }

  ngOnInit() {
    this.showError = false;
    this.sub = this.route.params.subscribe(params => {
      if (("undefined" !== typeof params["code"]) && ("" !== params["code"])) {
        this.code = params["code"];
        this.showPending = true;
        this.handleVerify(params["code"]);
      }
    });
  }

  onSubmit() {
    this.handleVerify(this.code);
  }

  handleVerify(code: string) {
    this.authService.handleVerify(code, () => {
      this.zone.run(() => {
        this.showError = this.showPending = false;
        this.showSuccess = true;
      });
      console.log('handleVerify returned successfully');
    }, (error: any, caught: Observable<any> = undefined) => {
      console.log('handleVerify failed: ' + error);
      this.zone.run(() => {
        this.showSuccess = this.showPending = false;
        this.showError = true;
      });
    });
  }
}
