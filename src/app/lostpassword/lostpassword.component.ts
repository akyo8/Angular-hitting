import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-lost-password',
  templateUrl: 'lostpassword.component.html',
  styleUrls: ['lostpassword.component.css']
})
export class LostPasswordComponent implements OnInit {
  authService: AuthService;
  email: string;
  showError: boolean = false;
  showSuccess: boolean = false;
  constructor(
    private router: Router,
    authService: AuthService
  ) {
    this.authService = authService;
  }

  ngOnInit() {
  }

  onSubmit() {
    this.authService.handleForgotPassword(this.email, () => {
      this.showError = false;
      this.showSuccess = true;
    }, (error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      this.showError = true;
      this.showSuccess = false;
      return caught;
    });
  }
}
