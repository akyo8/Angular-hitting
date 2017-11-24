import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ElementRef,
  OnInit,
  AfterContentInit,
  ContentChild
} from '@angular/core';

export interface ShrinkType {
    dir: string;
    size: number;
}

@Component({
  selector: 'app-property-slideout',
  exportAs: 'propertySlideout',
  template: `
<div class="property-slideout">
  <ng-content></ng-content>
</div>
  `
})
export class PropertySlideoutComponent implements OnInit, AfterContentInit {
  protected elementRef: ElementRef;
  protected initialized: boolean = false;
  private _active: boolean;
  private afterContentInit: boolean;

  @Input() tabHandle: string = ".handle";
  @Input() tabLocation: string = "left";
  @Input() topPos: string;
  @Input() leftPos: string;
  @Input() rightPos: string;
  @Input() bottomPos: string;
  @Input()
  set active(active: boolean) {
    this._active = active;
    if (this._active && this.afterContentInit) {
      this.initializeSlideout();
    }
  }
  @Output() toggle: EventEmitter<ShrinkType> = new EventEmitter<ShrinkType>();

  public constructor(
    elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
    this.afterContentInit = false;
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.afterContentInit = true;
    if (this._active) {
      this.initializeSlideout();
    }
  }

  initializeSlideout() {
    let opts = {
        tabHandle: this.tabHandle, //class of the element that will become your tab
        tabLocation: this.tabLocation, //side of screen where tab lives, top, right, bottom, or left
        speed: 300, //speed of animation
        action: 'click', //options: 'click' or 'hover', action to trigger animation
        fixedPosition: false, //options: true makes it stick(fixed position) on scroll
        onToggleSlide: (dir, size) => {
            this.toggle.emit({
              dir: this.tabLocation,
              size: size
            });
        }
    };
    let x: string;
    for (x of ["topPos", "leftPos", "rightPos", "bottomPos"]) {
        if (null !== this[x]) {
          opts[x] = this[x];
        }
    }
    // Initialize subject property tombstone
    jQuery(this.elementRef.nativeElement)["find"]('.property-slideout')["tabSlideOut"](opts);
    this.initialized = true;
  }
}
