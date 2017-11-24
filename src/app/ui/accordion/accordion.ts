import {
  Component,
  Input,
  QueryList,
  ContentChildren,
  Directive,
  TemplateRef,
  ContentChild,
  Output,
  EventEmitter,
  AfterContentChecked
} from '@angular/core';
import {isString} from '../util/util';
import {NgbAccordionConfig} from './accordion-config';

/**
 * This directive should be used to wrap accordion panel titles that need to contain HTML markup or other directives.
 */
@Directive({selector: 'template[ngbPanelTitle]'})
export class NgbPanelTitle {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * This directive must be used to wrap accordion panel content.
 */
@Directive({selector: 'template[ngbPanelContent]'})
export class NgbPanelContent {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * The NgbPanel directive represents an in individual panel with the title and collapsible
 * content
 */
@Directive({selector: 'ngb-panel, [ngbPanel]'})
export class NgbPanel {
  /**
   *  A flag determining whether the panel is disabled or not.
   *  When disabled, the panel cannot be toggled.
   */
  @Input() disabled = false;

  /**
   *  An optional id for the panel. The id should be unique.
   *  If not provided, it will be auto-generated.
   */
  @Input() id = `ngb-panel-generated`;

  /**
   *  The title for the panel.
   */
  @Input() title: string;

  /**
   *  Panel type (CSS class). Bootstrap 4 recognizes the following types: "success", "info", "warning" and "danger".
   */
  @Input() type: string;

  @Input() forceRender: boolean;

  @ContentChild(NgbPanelContent) contentTpl: NgbPanelContent;
  @ContentChild(NgbPanelTitle) titleTpl: NgbPanelTitle;

  constructor() {
    if ('ngb-panel-generated' === this.id) {
      this.id = 'ngb-panel-' + this.randomChars(8);
    }
  }

  randomChars(num: number) {
    let str = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let generated = '';

    for (let x = 0; x<num; x++) {
      generated += str[Math.floor(Math.random() * str.length)];
    }
    return generated;
  }
}

/**
 * The payload of the change event fired right before toggling an accordion panel
 */
export interface NgbPanelChangeEvent {
  /**
   * Id of the accordion panel that is toggled
   */
  panelId: string;

  /**
   * Whether the panel will be opened (true) or closed (false)
   */
  nextState: boolean;

  /**
   * Function that will prevent panel toggling if called
   */
  preventDefault: () => void;
}

/**
 * The NgbAccordion directive is a collection of panels.
 * It can assure that only panel can be opened at a time.
 */
@Component({
  selector: 'ngb-accordion',
  exportAs: 'ngbAccordion',
  template: `
    <template ngFor let-panel [ngForOf]="panels">
      <div [class]="'accordion ' + (panel.type ? 'card-'+panel.type: type ? 'card-'+type : '')" [class.active]="isOpen(panel.id)">
        <a tabindex="0" href (click)="!!toggle(panel.id)" [class.text-muted]="panel.disabled">
          {{panel.title}}<template [ngTemplateOutlet]="panel.titleTpl?.templateRef"></template>
        </a>
        <div class="user-content" *ngIf="isRendered(panel)" [hidden]="!isOpen(panel.id)">
          <template [ngTemplateOutlet]="panel.contentTpl.templateRef"></template>
        </div>
      </div>
    </template>
`
})
export class NgbAccordion implements AfterContentChecked {
  @ContentChildren(NgbPanel) panels: QueryList<NgbPanel>;

  /**
   * An array or comma separated strings of panel identifiers that should be opened
   */
  @Input() activeIds: string | string[] = [];

  /**
   *  Whether the other panels should be closed when a panel is opened
   */
  @Input('closeOthers') closeOtherPanels: boolean;

  /**
   *  Type of accordion's panels. Bootstrap 4 recognizes the following types: "success", "info", "warning" and "danger".
   */
  @Input() type: string;


  /**
   * A panel change event fired right before the panel toggle happens. See NgbPanelChangeEvent for payload details
   */
  @Output() panelChange = new EventEmitter<NgbPanelChangeEvent>();

  /**
   * A map that stores each panel state
   */
  private _states: Map<string, boolean> = new Map<string, boolean>();

  /**
   * A map that stores references to all panels
   */
  private _panelRefs: Map<string, NgbPanel> = new Map<string, NgbPanel>();

  constructor(config: NgbAccordionConfig) {
    this.type = config.type;
    this.closeOtherPanels = config.closeOthers;
  }

  /**
   * Programmatically toggle a panel with a given id.
   */
  toggle(panelId: string) {
    const panel = this._panelRefs.get(panelId);

    if (panel && !panel.disabled) {
      const nextState = !this._states.get(panelId);
      let defaultPrevented = false;

      this.panelChange.emit(
          {panelId: panelId, nextState: nextState, preventDefault: () => { defaultPrevented = true; }});

      if (!defaultPrevented) {
        this._states.set(panelId, nextState);

        if (this.closeOtherPanels) {
          this._closeOthers(panelId);
        }
        this._updateActiveIds();
      }
    }
  }

  ngAfterContentChecked() {
    // active id updates
    if (isString(this.activeIds)) {
      this.activeIds = (this.activeIds as string).split(/\s*,\s*/);
    }
    this._updateStates();

    // closeOthers updates
    if (this.activeIds.length > 1 && this.closeOtherPanels) {
      this._closeOthers(this.activeIds[0]);
      this._updateActiveIds();
    }
  }

  /**
   * @internal
   */
  isOpen(panelId: string): boolean { return this._states.get(panelId); }

  isRendered(panel: NgbPanel): boolean { return !!panel.forceRender || this._states.get(panel.id); }

  private _closeOthers(panelId: string) {
    this._states.forEach((state, id) => {
      if (id !== panelId) {
        this._states.set(id, false);
      }
    });
  }

  private _updateActiveIds() {
    this.activeIds =
        this.panels.toArray().filter(panel => this.isOpen(panel.id) && !panel.disabled).map(panel => panel.id);
  }

  private _updateStates() {
    this._states.clear();
    this._panelRefs.clear();
    this.panels.toArray().forEach((panel) => {
      this._states.set(panel.id, this.activeIds.indexOf(panel.id) > -1 && !panel.disabled);
      this._panelRefs.set(panel.id, panel);
    });
  }
}

export const NGB_ACCORDION_DIRECTIVES = [NgbAccordion, NgbPanel, NgbPanelTitle, NgbPanelContent];
