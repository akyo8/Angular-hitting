import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-reset-password',
  templateUrl: 'resetpassword.component.html',
  styleUrls: ['resetpassword.component.css']
})
export class ResetPasswordComponent implements OnInit {
  authService: AuthService;
  showError: boolean = false;
  showSuccess: boolean = false;
  private sub: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    authService: AuthService
  ) {
    this.authService = authService;
  }

  ngOnInit() {
    this.showError = false;
    this.sub = this.route.params.subscribe(params => {
      if (("undefined" !== typeof params["code"]) && ("" !== params["code"])) {
        this.handleResetVerify(params["code"]);
        this.authService.reset.code = params["code"];
      }
    });
  }

  onSubmit() {
    this.authService.handleResetConfirm(() => {
      this.showError = false;
      this.showSuccess = true;
    }, (error: any, caught: Observable<any> = undefined) => {
      this.showSuccess = false;
      this.showError = true;
    });
  }

  handleResetVerify(code: string) {
    this.authService.handleResetVerify(code, () => {
      this.showError = false;
      this.showSuccess = false;
    }, (error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      this.showSuccess = false;
      this.showError = true;
    });
  }
}
