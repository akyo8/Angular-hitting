import { NgModule, Component, ViewContainerRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing } from './app.routes';
import { Router } from '@angular/router';

import { environment } from './environment';
import { NgbModule } from './ui/index';
import { SliderModule } from './primeng/primeng';
import { BusyModule } from 'angular2-busy';
import { RlTagInputModule } from './angular2-tag-input/tag-input.module';
import { Ng2CompleterModule } from './ng2-completer/ng2-completer.module';
import { FloScrollerModule } from './ui/flo-scroller/flo-scroller.module';
import { Ng2PageScrollModule } from './ng2-page-scroll/ng2-page-scroll';
import { EditorModule, CalendarModule } from './primeng/primeng';
import { SimpleNotificationsModule, PushNotificationsModule } from 'angular2-notifications';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { PaginatePipe, PaginationControlsCmp, PaginationService } from './ng2-pagination/ng2-pagination';
import { FilterByTypePipe } from './search/filter-by-type.pipe';
import { LocalStorageService, LOCAL_STORAGE_SERVICE_CONFIG } from 'angular-2-local-storage';
import { EqualValidator } from './shared/equal-validator.directive';
import { Ng2StyledDirective } from './plugins/ng2-styled.directive';
import { SlideAbleDirective } from './plugins/slideable.directive';
import { FullScreenDirective } from './plugins/fullscreen.directive';
import { BourbonSelectComponent } from './bourbon/bourbon-select.component';
import { MaskedInputDirective } from './text-mask/text-mask.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './register/verify.component';
import { LostPasswordComponent } from './lostpassword/lostpassword.component';
import { ResetPasswordComponent } from './resetpassword/resetpassword.component';
import { ProfileComponent } from './profile/profile.component';
import { ContractComponent } from './contract/contract.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { SimpleSearchResultsComponent } from './simple-search/simple-search-results.component';
import { AuctionSearchResultsComponent } from './auction-search/auction-search-results.component';
import { SearchResultsWrapperComponent } from './search/search-results-wrapper.component';
import { PropertyComponent } from './property/property.component';
import { PropertySlideoutComponent } from './property/property-slideout.component';
import { PropertyInfoComponent } from './property/property-info.component';
import { PropertyTaxComponent } from './property/property-tax.component';
import { PropertyCensusComponent } from './property/property-census.component';
import { PropertyPoiComponent } from './property/property-poi.component';
import { PropertyTrendsComponent } from './property/property-trends.component';
import { PropertyAnalyticsComponent } from './property/property-analytics.component';
import { PropertyAuctionsComponent } from './property/property-auctions.component';
import { PropertyGeneralComponent } from './property/property-general.component';
import { PropertyFlipComponent } from './property/property-flip.component';
import { PropertyRentComponent } from './property/property-rent.component';
import { PropertyCompsComponent } from './property/property-comps.component';
import { PhotoAddendumComponent } from './property/property-photos.component';
import { ImageEditorMultiComponent } from './imged/editor-multi.component';
import { SimpleSearchComponent } from './simple-search/simple-search.component';
import { AdvanceSearchComponent } from './advance-search/advance-search.component';
import { SavedSearchComponent } from './saved-search/saved-search.component';
import { SearchFormComponent } from './search/search-form.component';
import { SearchResultsComponent } from './search/search-results.component';
import { GoogleMapComponent } from './map/google-map.component';
import { GoogleStreetviewComponent } from './map/google-streetview.component';
import { BingBirdseyeviewComponent } from './map/bing-birdseyeview.component';
import { GoogleInfoboxCompComponent } from './map/google-infobox-comp.component';
import { GoogleLabelCompComponent } from './map/google-label-comp.component';
import { PlaceholderPipe } from './pipes/placeholder.pipe';

import { AuthService } from './auth/auth.service';
import { CanActivateViaAuthGuard } from './auth/auth.canactivate';
import { SearchService } from './search/search.service';
import { PropertyService } from './property/property.service';
import { NotesService } from './property/notes.service';
import { ContractService } from './contract/contract.service';

import { AccordionModule } from "ngx-accordion";
import { ContentEditableDirective } from './contenteditable/contenteditable.directive';

import {} from '@types/googlemaps';

declare let window: any;

var __bingMapsLoaded = false;
function bingMapsLoaded() {
    __bingMapsLoaded = true;
}

window.bingMapsLoaded = bingMapsLoaded;

export function isBingMapsLoaded() {
    return __bingMapsLoaded;
}

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  styles: [`.router-link-active { background-color: red; }`]
})
export class AppComponent {
  public viewContainerRef: ViewContainerRef;
  title: string = 'app kdlclkworks!';
  templateClass: string;
  isAuth: boolean;

  public constructor(private router: Router, viewContainerRef: ViewContainerRef) {
    // Bootstrap (ui folder) modal "hack"
    this.viewContainerRef = viewContainerRef;
    this.isAuth = false;
    this.templateClass = "search";
    this.router.events.subscribe(x => {
      this.setTemplate(x.url);
    });
    // Load Bing Maps dynamically
    jQuery.getScript("http://www.bing.com/api/maps/mapcontrol?branch=release&callback=bingMapsLoaded");
  }

  setTemplate(url: string) {
    let authRoutes = ['login', 'register', 'verify', 'lostpassword', 'reset', 'subscribe'];
    let match = url.match(new RegExp(authRoutes.join("|"), "i"));
    console.log("Url", url, match);
    this.isAuth = match && (match.length > 0);
    this.templateClass = "search";
    for (let auth of authRoutes) {
      match = url.match(new RegExp(auth, "i"));
      if (match && (match.length > 0)) {
        this.templateClass = ('register' !== auth) ? 'login' : auth;
        break;
      }
    }
  }
}

@NgModule({
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    RlTagInputModule,
    Ng2CompleterModule,
    SliderModule,
    BusyModule,
    FloScrollerModule,
    Ng2PageScrollModule,
    EditorModule,
    CalendarModule,
    SimpleNotificationsModule,
    PushNotificationsModule,
    FileUploadModule,
    AccordionModule
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    SubscribeComponent,
    RegisterComponent,
    VerifyComponent,
    LostPasswordComponent,
    ResetPasswordComponent,
    ProfileComponent,
    ContractComponent,
    SearchComponent,
    WatchlistComponent,
    SimpleSearchResultsComponent,
    AuctionSearchResultsComponent,
    SearchResultsWrapperComponent,
    PropertyComponent,
    PaginationControlsCmp,
    PaginatePipe,
    FilterByTypePipe,
    EqualValidator,
    SlideAbleDirective,
    Ng2StyledDirective,
    FullScreenDirective,
    BourbonSelectComponent,
    MaskedInputDirective,
    ContentEditableDirective,
    HeaderComponent,
    FooterComponent,
    PropertySlideoutComponent,
    PropertyInfoComponent,
    PropertyTaxComponent,
    PropertyCensusComponent,
    PropertyPoiComponent,
    PropertyTrendsComponent,
    PropertyAnalyticsComponent,
    PropertyAuctionsComponent,
    PropertyGeneralComponent,
    PropertyFlipComponent,
    PropertyRentComponent,
    PropertyCompsComponent,
    PhotoAddendumComponent,
    ImageEditorMultiComponent,
    SimpleSearchComponent,
    AdvanceSearchComponent,
    SavedSearchComponent,
    SearchFormComponent,
    SearchResultsComponent,
    GoogleMapComponent,
    GoogleStreetviewComponent,
    BingBirdseyeviewComponent,
    GoogleInfoboxCompComponent,
    GoogleLabelCompComponent,
    PlaceholderPipe
  ],
  providers: [
    PaginationService,
    SearchService,
    PropertyService,
    NotesService,
    ContractService,
    AuthService,
    CanActivateViaAuthGuard,
    LocalStorageService,
    {
        provide: LOCAL_STORAGE_SERVICE_CONFIG,
        useValue: /*environment.localStorageServiceConfig*/ {
            "prefix": "cm-",
            "storageType": "localStorage"
        }
    }
  ],
  entryComponents: [ GoogleInfoboxCompComponent, GoogleLabelCompComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
