import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  Directive,
  TemplateRef,
  ContentChild,
  OnInit,
  AfterContentChecked,
  Output,
  EventEmitter
} from '@angular/core';
import {NgbTabsetConfig} from './tabset-config';
import {NgbTabsetService} from './tabset-service';

let nextId = 0;

/**
 * This directive should be used to wrap tab titles that need to contain HTML markup or other directives.
 */
@Directive({selector: 'template[ngbTabTitle]'})
export class NgbTabTitle {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * This directive must be used to wrap content to be displayed in a tab.
 */
@Directive({selector: 'template[ngbTabContent]'})
export class NgbTabContent {
  constructor(public templateRef: TemplateRef<any>) {}
}

/**
 * A directive representing an individual tab.
 */
@Directive({selector: 'ngb-tab'})
export class NgbTab {
  /**
   * Unique tab identifier. Must be unique for the entire document for proper accessibility support.
   */
  @Input() id: string = `ngb-tab-${nextId++}`;
  /**
   * Simple (string only) title. Use the "NgbTabTitle" directive for more complex use-cases.
   */
  @Input() title: string;
  /**
   * Allows toggling disabled state of a given state. Disabled tabs can't be selected.
   */
  @Input() disabled = false;

  @ContentChild(NgbTabContent) contentTpl: NgbTabContent;
  @ContentChild(NgbTabTitle) titleTpl: NgbTabTitle;
}

/**
 * The payload of the change event fired right before the tab change
 */
export interface NgbTabChangeEvent {
  /**
   * Id of the currently active tab
   */
  activeId: string;

  /**
   * Id of the newly selected tab
   */
  nextId: string;

  /**
   * Function that will prevent tab switch if called
   */
  preventDefault: () => void;
}

/**
 * A component that makes it easy to create tabbed interface.
 */
@Component({
  selector: 'ngb-tabset',
  exportAs: 'ngbTabset',
  template: `
    <ul [class]="'nav-' + type" role="tablist">
      <li [ngClass]="{'active': tab.id === activeId}" *ngFor="let tab of tabs">
        <a [id]="tab.id" [class.active]="tab.id === activeId" [class.disabled]="tab.disabled"
          href (click)="!!select(tab.id)">
          {{tab.title}}<template [ngTemplateOutlet]="tab.titleTpl?.templateRef"></template>
        </a>
      </li>
    </ul>
    <div class="tab-content" *ngIf="!tabsOnly">
      <template ngFor let-tab [ngForOf]="tabs">
        <div class="tab-pane active" *ngIf="tab.id === activeId" role="tabpanel" [attr.aria-labelledby]="tab.id">
          <template [ngTemplateOutlet]="tab.contentTpl.templateRef"></template>
        </div>
      </template>
    </div>
  `
})
export class NgbTabset implements OnInit, AfterContentChecked {
  @ContentChildren(NgbTab) tabs: QueryList<NgbTab>;

  /**
   * An identifier of an initially selected (active) tab. Use the "select" method to switch a tab programmatically.
   */
  @Input() activeId: string;

  /**
   * Type of navigation to be used for tabs. Can be one of 'tabs' or 'pills'.
   */
  @Input() type: 'tabs' | 'pills';

  @Input() tabsOnly: boolean = false;

  @Input() tabsId: string;

  /**
   * A tab change event fired right before the tab selection happens. See NgbTabChangeEvent for payload details
   */
  @Output() tabChange = new EventEmitter<NgbTabChangeEvent>();

  constructor(config: NgbTabsetConfig, private service: NgbTabsetService) { this.type = config.type; }

  ngOnInit() {
    if (this.tabsId) {
      this.service.add(this.tabsId, this);
    }
  }

  ngOnDestroy() {
    if (this.tabsId) {
      this.service.remove(this.tabsId);
    }
  }

  /**
   * Selects the tab with the given id and shows its associated pane.
   * Any other tab that was previously selected becomes unselected and its associated pane is hidden.
   */
  select(tabId: string) {
    let selectedTab = this._getTabById(tabId);
    if (selectedTab && !selectedTab.disabled && this.activeId !== selectedTab.id) {
      let defaultPrevented = false;

      this.tabChange.emit(
          {activeId: this.activeId, nextId: selectedTab.id, preventDefault: () => { defaultPrevented = true; }});

      if (!defaultPrevented) {
        this.activeId = selectedTab.id;
      }
    }
  }

  ngAfterContentChecked() {
    // auto-correct activeId that might have been set incorrectly as input
    let activeTab = this._getTabById(this.activeId);
    this.activeId = activeTab ? activeTab.id : (this.tabs.length ? this.tabs.first.id : null);
  }

  private _getTabById(id: string): NgbTab {
    let tabsWithId: NgbTab[] = this.tabs.filter(tab => tab.id === id);
    return tabsWithId.length ? tabsWithId[0] : null;
  }
}

@Component({
  selector: 'ngb-tabset-content',
  exportAs: 'ngbTabsetContent',
  template: `
    <div class="tab-content">
      <template ngFor let-tab [ngForOf]="service.get(tabsId).tabs">
        <div class="tab-pane active" *ngIf="tab.id === service.get(tabsId).activeId" role="tabpanel" [attr.aria-labelledby]="tab.id">
          <template [ngTemplateOutlet]="tab.contentTpl.templateRef"></template>
        </div>
      </template>
    </div>
  `
})
export class NgbTabsetContent {
  @Input() tabsId: string;

  constructor(private service: NgbTabsetService) {}
}

export const NGB_TABSET_DIRECTIVES = [NgbTabset, NgbTabsetContent, NgbTab, NgbTabContent, NgbTabTitle];
