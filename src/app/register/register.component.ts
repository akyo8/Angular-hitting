import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.css']
})
export class RegisterComponent implements OnInit {
  authService: AuthService;
  showDuplicate: boolean = false;
  showError: boolean = false;
  showSuccess: boolean = false;
  constructor(
    private router: Router,
    authService: AuthService
  ) {
    this.authService = authService;
    console.log("Init register component!");
  }

  ngOnInit() {
    this.showDuplicate = false;
    this.showError = false;
    this.showSuccess = false;
  }

  onSubmit() {
    this.authService.handleRegister((result: string) => {
      this.showError = false;
      this.showDuplicate = false;
      this.showSuccess = true;
      this.authService.handleLogout();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 10000);
    }, (error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      if (error._body == "Cannot Reregister Email") {
        this.showDuplicate = true;
        this.showError = false;
      } else {
        this.showError = true;
        this.showDuplicate = false;
      }
      this.showSuccess = false;
      return caught;
    });
  }
}
