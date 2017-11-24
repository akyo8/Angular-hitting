import {Directive, ElementRef, Input} from '@angular/core';
import {NgControl} from '@angular/forms';
import createTextMaskInputElement from './createTextMaskInputElement';

@Directive({
  host: {
    '(input)': 'onInput()'
  },
  selector: 'input[textMask]'
})
export class MaskedInputDirective {
  private textMaskInputElement: any;
  private inputElement: HTMLInputElement;

  @Input('textMask')
  textMaskConfig = {
    mask: '',
    guide: true,
    placeholderChar: '_',
    pipe: undefined,
    pipeValue: undefined,
    keepCharPositions: false,
    onReject: undefined,
    onAccept: undefined
  };

  constructor(inputElement: ElementRef, private ngControl: NgControl) {
    this.inputElement = inputElement.nativeElement;
  }

  ngOnInit() {
    this.textMaskInputElement = createTextMaskInputElement(Object.assign({inputElement: this.inputElement}, this.textMaskConfig));

    // This ensures that initial model value gets masked
    setTimeout(() => this.onInput());
  }

  onInput() {
    let config = Object.assign({inputElement: this.inputElement}, this.textMaskConfig);
    let value: any = this.inputElement.value;
    this.textMaskInputElement.update();
    if ("function" === typeof this.textMaskConfig.pipeValue) {
      let newvalue = this.textMaskConfig.pipeValue(value, config);
      if (!newvalue.rejected) {
         value = newvalue.value;
      }
    }
    this.ngControl.viewToModelUpdate(value);
  }
}

export {MaskedInputDirective as Directive};
