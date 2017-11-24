import { Injectable } from '@angular/core';

@Injectable()
export class NgbTabsetService {
  private tabsets: any = {};
  constructor() {}

  add(tabsetId: string, tabset: any) {
    this.tabsets[tabsetId] = tabset;
  }

  remove(tabsetId: string) {
    delete this.tabsets[tabsetId];
  }

  get(tabsetId: string) {
    return (("undefined" !== typeof this.tabsets[tabsetId]) && this.tabsets[tabsetId]) ?
      this.tabsets[tabsetId] : { tabs: [] };
  }

  select(tabsetId: string, tab: string) {
    if (("undefined" !== typeof this.tabsets[tabsetId]) &&
        this.tabsets[tabsetId] &&
        this.tabsets[tabsetId].select) {
        this.tabsets[tabsetId].select(tab);
    }
  }
}
