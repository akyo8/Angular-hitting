import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../search/search.service';
import { AuthService } from '../auth/auth.service';

@Component({
  moduleId: module.id,
  selector: 'app-header',
  templateUrl: 'header.component.html'
})
export class HeaderComponent implements OnInit {
  searchService: SearchService;
  authService: AuthService;
  siteTitle:string;
  isFullScreen:boolean;

  constructor(
    private router: Router,
    searchService: SearchService,
    authService: AuthService
  ) {
    this.searchService = searchService;
    this.authService = authService;
  }

  ngOnInit() {
    this.siteTitle = 'HomeInvestorTool.com';
    this.isFullScreen = false;
    if (this.authService.isAuthenticated()) {
        this.searchService.getWatchlistProperties((error:any, caught: Observable<any>) => {
          console.log(error);
          return caught;
        });
    }
  }

  toggleFullscreen() {
    this.isFullScreen = !this.isFullScreen;
  }

  cancelFullScreen() {
    this.isFullScreen = false;
  }

  logout() {
    this.authService.handleLogout();
    this.router.navigate(['/login']);
  }
}
