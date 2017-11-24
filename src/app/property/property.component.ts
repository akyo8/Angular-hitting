import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { Location } from '@angular/common';
import {Observable} from 'rxjs/Rx';
import { DOCUMENT } from '@angular/platform-browser';
import { PageScrollInstance, PageScrollService } from '../ng2-page-scroll/ng2-page-scroll';
import * as moment from 'moment/moment';
import { PropertyService } from './property.service';
import { SearchService } from '../search/search.service';
import { AuthService } from '../auth/auth.service';
import { NotesService } from './notes.service';
import { GoogleStreetviewComponent } from '../map/google-streetview.component';
import { NgbModal, ModalDismissReasons, NgbTabsetService } from '../ui/index';
import { EditorModule, SharedModule } from '../primeng/primeng';

@Component({
  moduleId: module.id,
  selector: 'app-property',
  templateUrl: 'property.component.html',
  styleUrls: ['property.component.css']
})
export class PropertyComponent implements OnInit, OnDestroy, AfterViewInit {
  propertyService: PropertyService;
  searchService: SearchService;
  authService: AuthService;
  notesService: NotesService;
  activeTab: string;
  imageTab: string;
  galleryTab: string;
  private sub: any;
  private document: Document;
  pageScrollInstance: PageScrollInstance;
  pageScrollService: PageScrollService;
  showGallerySlider: boolean = false;
  activeModal: any = null;

  constructor(private route: ActivatedRoute,
        private router: Router, propertyService: PropertyService,
        private location: Location,
        searchService: SearchService,
        authService: AuthService,
        notesService: NotesService,
        private modalService: NgbModal,
        private tabsetService: NgbTabsetService,
        pageScrollService: PageScrollService,
        @Inject(DOCUMENT) document: any) {
    this.authService = authService;
    this.propertyService = propertyService;
    this.searchService = searchService;
    this.notesService = notesService;
    this.document = <Document> document;
    this.pageScrollService = pageScrollService;
  }

  doChange() {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let bippoId = this.propertyService.parsePropertyId(params['addr']);
      this.propertyService.getProperty(bippoId, () => {
      }, (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
      this.propertyService.getPropertyFlipData(bippoId, () => {
          this.propertyService.generatePropertyFlipDeps();
      }, (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
      this.propertyService.getPropertyRentData(bippoId, () => {
          this.propertyService.generatePropertyRentDeps();
      },(error, caught) => {
          console.log(error);
          return caught;
      });
      this.propertyService.getPropertyCompsData(bippoId, "all", //"arv",
        () => {},
        (error:any, caught: Observable<any>) => {
        console.log(error);
        return caught;
      });
      this.notesService.getPropertyNotes(bippoId, (error, caught) => {
          console.log(error);
          return caught;
      });
      this.activeTab = 'tab-general';
      this.galleryTab = "tab-gallery";
      this.imageTab = 'tab-image';
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initPageScroll();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  backToSearch() {
    this.location.back();
  }

  initPageScroll() {
    this.pageScrollInstance = PageScrollInstance.advancedInstance(
        this.document,
        "#ninjaSliderModal",
        null,
        null, //this.pageScroll,
        40, //this.pageScrollOffset,
        null, //this.pageScrollInterruptible,
        null, //this.pageScrollEasing,
        null, //this.pageScrollDuration,
        null  //this.pageScrollFinish
    );
  }

  launchGallery(index = 0) {
    if (!this.showGallerySlider) {
      this.showGallerySlider = true;
      setTimeout(() => {
        this.pageScrollService.start(this.pageScrollInstance);
        if ("tab-gallery" === this.galleryTab) {
          this.propertyService.initSliders("ninjaSliderModal", "thumbSliderModal", 0);
        }
      }, 50);
    }
  }

  selectImage(tabname: string) {
    this.imageTab = tabname;
  }

  selectGallery(tabname: string) {
    this.galleryTab = tabname;
  }

  toggleWatchlistSearchListing() {
    this.searchService.toggleWatchlistSearchListing(this.propertyService.getCurrentProperty().identifier.bippoId, (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  showNotesModal(event, content) {
      event.preventDefault();

      if (this.activeModal) {
          this.activeModal.close();
          this.activeModal = null;
      } else {
          this.activeModal = this.modalService.open(content);
          this.activeModal.result.then((result) => {
            // Do nothing
          }, (reason) => {
            // Do nothing
          });
      }
  }

  savePropertyNote() {
    this.notesService.savePropertyNote(this.propertyService.getPropertyId(), (error:any, caught: Observable<any>) => {
      console.log(error);
      return caught;
    });
  }

  setActiveTab(tab: string) {
    console.log("Setting active tab", tab);
    this.tabsetService.select("property-tabs", tab);
    //this.activeTab = tab;
  }

  setGalleryTab(tabname: string) {
    this.galleryTab = tabname;
    if ("tab-gallery" === tabname) {
      this.propertyService.initSliders("ninjaSliderModal", "thumbSliderModal", 0);
    }
  }

  isMapActive(view: string) {
    let property: any = this.propertyService.getCurrentProperty();

    return (this.galleryTab == view) &&
        ("undefined" !== typeof property.location) &&
        property.location.latitude &&
        property.location.longitude;
  }

  formatDate(dt, fmt) {
    return moment(dt).format(fmt);
  }

  roundDom(dom) {
    for (let i = 14; i < 365; i += 14) if (dom < i) return '< ' + i;
    return '> 365';
  }

  makeOffer() {
    this.router.navigate(['/contract', this.propertyService.getCurrentProperty().identifier.bippoId]);
  }
}
