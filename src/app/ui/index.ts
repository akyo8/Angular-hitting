import {NgModule, ModuleWithProviders} from '@angular/core';

import {NgbAccordionModule, NgbPanelChangeEvent} from './accordion/accordion.module';
import {NgbCollapseModule} from './collapse/collapse.module';
import {NgbModalModule, NgbModal, NgbModalOptions, NgbModalRef, ModalDismissReasons} from './modal/modal.module';
import {NgbPopoverModule} from './popover/popover.module';
import {NgbTabsetModule, NgbTabChangeEvent, NgbTabsetService} from './tabset/tabset.module';

export {NgbAccordionModule, NgbPanelChangeEvent, NgbAccordionConfig} from './accordion/accordion.module';
export {NgbCollapseModule} from './collapse/collapse.module';
export {NgbModalModule, NgbModal, NgbModalOptions, NgbModalRef, ModalDismissReasons} from './modal/modal.module';
export {NgbPopoverModule} from './popover/popover.module';
export {NgbTabsetModule, NgbTabChangeEvent, NgbTabsetConfig, NgbTabsetService} from './tabset/tabset.module';

const NGB_MODULES = [
  NgbAccordionModule, NgbCollapseModule, NgbModalModule, NgbPopoverModule, NgbTabsetModule
];

@NgModule({
  imports: [
    NgbCollapseModule.forRoot(), NgbAccordionModule.forRoot(), NgbModalModule.forRoot(),
    NgbPopoverModule.forRoot(), NgbTabsetModule.forRoot()
  ],
  exports: NGB_MODULES
})
export class NgbRootModule {
}

@NgModule({imports: NGB_MODULES, exports: NGB_MODULES})
export class NgbModule {
  static forRoot(): ModuleWithProviders { return {ngModule: NgbRootModule}; }
}
