import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'filterByType',
    pure: false
})
@Injectable()
export class FilterByTypePipe implements PipeTransform {
    transform(items: any[], args: any, display: boolean): any {
        return items.filter(item => {
          return (display && (item.type === args.retsShortValue));
        });
    }
}
