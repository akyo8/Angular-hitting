import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NGB_TABSET_DIRECTIVES} from './tabset';
import {NgbTabsetConfig} from './tabset-config';
import {NgbTabsetService} from './tabset-service';

export {NgbTabChangeEvent} from './tabset';
export {NgbTabsetConfig} from './tabset-config';
export {NgbTabsetService} from './tabset-service';

@NgModule({declarations: NGB_TABSET_DIRECTIVES, exports: NGB_TABSET_DIRECTIVES, imports: [CommonModule]})
export class NgbTabsetModule {
  static forRoot(): ModuleWithProviders { return {ngModule: NgbTabsetModule, providers: [NgbTabsetConfig, NgbTabsetService]}; }
}
