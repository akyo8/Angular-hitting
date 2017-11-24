import {
  Component,
  Input,
  TemplateRef,
  ElementRef,
  OnInit,
  AfterContentInit,
  ContentChild,
  HostListener
} from '@angular/core';

@Component({
  selector: 'flo-scroller',
  exportAs: 'floScroller',
  template: `
<div class="flo-buttons">
  <ng-content></ng-content>
</div>
  `
})
export class FloScroller implements OnInit, AfterContentInit {
  protected elementRef: ElementRef;
  protected topOffset: number;
  protected initialized: boolean = false;
  protected timer: any = null;

  public constructor(
    elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
  }

  ngOnInit() {
    this.topOffset = 15;
  }

  ngAfterContentInit() {
    let $element = jQuery(this.elementRef.nativeElement)["find"](".flo-buttons"),
        $window = jQuery(window),
        height = $element["height"]() || 50;
    this.topOffset = Math.floor(($window["height"]() - height) / 2);
    $element["css"]("top", this.topOffset);
    this.initialized = true;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    if (this.initialized && !this.timer) {
        this.timer = setTimeout(() => {
            this.timer = null;
            let $element = jQuery(this.elementRef.nativeElement)["find"](".flo-buttons"),
                $window = jQuery(window)
                ;
            if ($window["scrollTop"]() > this.topOffset) {
                $element["stop"]()["animate"]({
                    marginTop: $window["scrollTop"]()
                });
            } else {
                $element["stop"]()["animate"]({
                    marginTop: 0
                });
            }
        }, 400);
    }
  }
}
