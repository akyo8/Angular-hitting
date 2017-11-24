import { NgModule } from "@angular/core";
import {CommonModule} from '@angular/common';
import { FloScroller } from "./flo-scroller.component";

@NgModule({
    declarations: [
        FloScroller
    ],
    providers: [],
    exports: [
        FloScroller
    ],
    imports: [
        CommonModule
    ]
})
export class FloScrollerModule {}
