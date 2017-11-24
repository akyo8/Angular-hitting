import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanActivateViaAuthGuard } from './auth/auth.canactivate';
import { LoginComponent } from './login/login.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './register/verify.component';
import { ProfileComponent } from './profile/profile.component';
import { ContractComponent } from './contract/contract.component';
import { LostPasswordComponent } from './lostpassword/lostpassword.component';
import { ResetPasswordComponent } from './resetpassword/resetpassword.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { SimpleSearchResultsComponent } from './simple-search/simple-search-results.component';
import { SearchResultsWrapperComponent } from './search/search-results-wrapper.component';
import { PropertyComponent } from './property/property.component';
import { AuctionSearchResultsComponent } from './auction-search/auction-search-results.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify/:code', component: VerifyComponent },
  { path: 'subscribe', component: SubscribeComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'profile/:section', component: ProfileComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'contract/:addr', component: ContractComponent },
  { path: 'lostpassword', component: LostPasswordComponent },
  { path: 'reset/:code', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'simple-search-results/:query', component: SimpleSearchResultsComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'search-results/:query', component: SearchResultsWrapperComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'auction-search/:query', component: AuctionSearchResultsComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'property/:addr', component: PropertyComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: '', component: DashboardComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

export const routing = RouterModule.forRoot(routes);
