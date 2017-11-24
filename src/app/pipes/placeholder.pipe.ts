import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'placeholder' })
export class PlaceholderPipe implements PipeTransform {
  transform(value: string, placeholder: string): string {
    return (("undefined" !== typeof value) && value) ? value : placeholder;
  }
}
