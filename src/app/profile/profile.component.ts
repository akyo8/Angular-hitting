import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit {
  authService: AuthService;
  profileTab: string;
  private sub: any;
  private displayLicenses: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    authService: AuthService
  ) {
    this.authService = authService;
    console.log("Init profile component!");
  }

  ngOnInit() {
    this.profileTab = "profile";
    this.authService.getHomeWarrantyServiceProviders();

    this.sub = this.route.params.subscribe(params => {
      if (("undefined" !== typeof params["section"]) && ("" !== params["section"])) {
        this.profileTab = params["section"];
      }
    });
    this.authService.getProfileData(() => {
      if ("" === this.authService.profile.licenses) {
        this.displayLicenses = true;
      }
    }, (error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      return caught;
    });
  }

  onSubmit() {
    this.authService.saveProfileData((error: any, caught: Observable<any> = undefined) => {
      console.log(error);
      return caught;
    });
  }

  setProfileTab(tab: string) {
    this.profileTab = tab;
  }

  logout() {
    this.authService.handleLogout();
    this.router.navigate(['/login']);
  }
}
