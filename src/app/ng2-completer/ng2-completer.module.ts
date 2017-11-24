import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { CompleterCmp } from "./components/ng2-completer/completer-cmp";
import { CompleterListCmp } from "./components/ng2-completer/completer-list-cmp";
import { CompleterListItemCmp } from "./components/ng2-completer/completer-list-item-cmp";
import { CompleterService } from "./components/ng2-completer/services/completer-service";
import { LocalDataFactoryProvider, RemoteDataFactoryProvider } from "./components/ng2-completer/services/completer-data-factory";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule
    ],
    declarations: [
        CompleterCmp,
        CompleterListCmp,
        CompleterListItemCmp
    ],
    providers: [
        CompleterService,
        LocalDataFactoryProvider,
        RemoteDataFactoryProvider
    ],
    exports: [
        CompleterCmp
    ]
})
export class Ng2CompleterModule {}
