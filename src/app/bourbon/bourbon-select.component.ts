import {
  Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges, ElementRef
} from '@angular/core';
import {NgClass} from '@angular/common';

interface ISelectOption {
    value: string;
    label: string;
    index?: string;
}

/* tslint:disable:component-selector-name */
@Component({
  selector: 'bourbon-select',
  host: {
    "(document: click)": "handleEvent( $event )",
    "(document: mousedown)": "handleEvent( $event )",
    "(document: mouseup)": "handleEvent( $event )"
  },
  template: `
    <div class="select" [ngClass]="{'is-selected': isOpen}">
      <div class="select-value" (click)="toggleOpen($event)">{{label}}</div>
      <div class="select-dropdown" [ngClass]="{'is-visible': isOpen}">
        <span
            *ngFor="let option of options"
            class="select-value"
            [ngClass]="{'is-active': hasValue(option.value)}"
            (click)="select(option.value)">{{option.label}}</span>
        <span *ngIf="input"
            class="select-value input">
            <input type="text" placeholder="Enter value"
                [(ngModel)]="value" (blur)="selectCustom(value)" />
        </span>
        <span *ngIf="pctInput"
            class="select-value input">
            <input type="text" [textMask]="{mask: percentMask, pipeValue: decimalPercent}"
                placeholder="_%"
                [(ngModel)]="value" (blur)="selectCustom(value)" />
        </span>
      </div>
    </div>
  `
})
export class BourbonSelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public options: Array<ISelectOption>;
  @Input() public model: string|Array<string>;
  @Input() public input: boolean;
  @Input() public pctInput: boolean;
  @Input() public formatInput: Function;
  @Input() public multiple: boolean;
  @Input() public isDisabled: boolean;
  @Output() public modelUpdate: EventEmitter<string | Array<string>> = new EventEmitter<string | Array<string>>();
  public label: string;
  public value: string;
  protected elementRef: ElementRef;

  @Input()
  public get isOpen():boolean {
    return this._isOpen;
  }

  public set isOpen(value:boolean) {
    this._isOpen = value;
  }

  private _isOpen:boolean;

  public constructor(elementRef: ElementRef) {
    this.elementRef = elementRef;
  }

  public ngOnInit():any {
    this.init();
  }

  public init() {
    this.label = "";
    let a: Array<string> = [];
    for (let x of this.options) {
      if (this.multiple) {
        if (-1 !== (<Array<string>>this.model).indexOf(x.value)) {
          if ("undefined" !== typeof x.index) {
            a.push(x.index);
          } else {
            a.push(x.label);
          }
        }
      } else {
        if (this.model === x.value) {
          if ("undefined" !== typeof x.index) {
            this.label = x.index;
          } else {
            this.label = x.label;
          }
          break;
        }
      }
    }
    if (this.multiple && (a.length > 0)) {
      this.label = a.join(", ");
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    //this.select(this.model);
    this.init();
  }

  public ngOnDestroy():any {
  }

  public toggleOpen(event:MouseEvent):any {
    event.preventDefault();
    if (!this.isDisabled) {
      this.isOpen = !this.isOpen;
    }
  }

  public hasValue(value: string) {
    if (this.multiple) {
      return (-1 !== this.model.indexOf(value));
    } else {
      return (this.model === value);
    }
  }

  protected toggleLabel(label: string) {
    if (this.multiple) {
      let a = this.label.split(", ");
      if ((1 == a.length) && ("" === a[0])) {
        a.length = 0;
      }
      let pos = a.indexOf(label);
      if (-1 !== pos) {
        (<Array<string>>a).splice(pos, 1);
      } else {
        a.push(label);
      }
      this.label = a.join(", ");
    }
  }

  protected toggleValue(value: string) {
    if (this.multiple) {
      let pos = this.model.indexOf(value);
      if (-1 !== pos) {
        (<Array<string>>this.model).splice(pos, 1);
      } else {
        (<Array<string>>this.model).push(value);
      }
    }
  }

  public select(value: string | Array<string>, update?: boolean) {
    if ("undefined" === typeof update) {
      update = true;
    }
    for (let opt of this.options) {
      if (("undefined" !== typeof opt.value) &&
        ("undefined" !== typeof opt.label)) {
        if (opt.value === value) {
          if (this.multiple) {
            this.toggleLabel(opt.label);
            if ("undefined" !== typeof opt.index) {
              this.toggleValue(opt.index);
            } else {
              this.toggleValue(opt.value);
            }
          } else {
            this.label = opt.label;
            if ("undefined" !== typeof opt.index) {
              this.model = opt.index;
            } else {
              this.model = opt.value;
            }
          }
          if (update) {
            this.modelUpdate.emit(this.model);
          }
          if (!this.multiple) {
            this.isOpen = false;
          }
          break;
        }
      }
    }
  }

  public selectCustom(value: string) {
    if (this.formatInput && ("function" === typeof this.formatInput)) {
      this.label = this.formatInput(parseFloat(value));
    } else {
      this.label = value;
    }
    this.modelUpdate.emit(value);
    this.isOpen = false;
  }

  protected handleEvent( globalEvent ) {
    if ( this.eventTriggeredInsideHost( globalEvent ) ) {
      return;
    }
    this.isOpen = false;
  }

  protected eventTriggeredInsideHost( event ) {
    let current = event.target;
    let host = this.elementRef.nativeElement;
    do {
      if ( current === host ) {
        return( true );
      }
      current = current.parentNode;
    } while ( current );
    return( false );
  }

  public percentMask(inputString: string) {
    let numericLength = 0;
    let matchArray: Array<string | RegExp> = [];
    matchArray.push(/\d/);
    for (numericLength = 1; numericLength < inputString.length; numericLength++) {
      if (!/\d/.test(String(inputString[numericLength]))) {
        matchArray.push('%');
        return matchArray;
      } else {
        matchArray.push(/\d/);
      }
    }

    matchArray.push('%');
    return matchArray;
  }

  decimalToPercent(value: number) {
    if (value) {
      return value * 100;
    } else {
      return 0;
    }
  }

  decimalPercent(conformedValue: string, config): any {
    let matches = conformedValue.match(/(\d+)\%?/);
    if (matches && (matches.length > 1) && (matches[1].length > 0)) {
      return {value: parseFloat(matches[1]) / 100};
    } else {
      return {value: 0};
    }
  }
}
