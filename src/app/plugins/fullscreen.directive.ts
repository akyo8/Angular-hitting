import {Directive, Input, Output, OnInit, OnDestroy, EventEmitter, Renderer, ElementRef} from '@angular/core'

declare let Element:any;
declare let document:any;

@Directive({
    selector: '[fullScreen]'
})
export class FullScreenDirective implements OnInit, OnDestroy {
    private isKeyboardAvailbleOnFullScreen: boolean;
    private initialized: boolean;
    private isFullScreen: boolean;
    private _listeners: Array<any>;

    @Input() set fullScreen(fs: boolean) {
      if ("string" === typeof fs) {
        fs = ("true" === (<string>fs).toLowerCase());
      }
      this.isFullScreen = fs;
      this.setFullScreen();
    }

    @Output('cancel') cancelEvent: EventEmitter<any> = new EventEmitter<any>();

    constructor(private el:ElementRef, private renderer: Renderer) {
    }

    ngOnInit() {
        let evName: string;
        this._listeners = [];
        // ensure ALLOW_KEYBOARD_INPUT is available and enabled
        this.isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;

        for (evName of ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']) {
            this._listeners.push(this.renderer.listenGlobal('document', evName, (event) => {
                if (!this.isEnabled()) {
                    this.cancelEvent.emit(null);
                }
            }));
        }
    }

    ngOnDestroy() {
       let evHandle: any;
       for (evHandle of this._listeners) {
         evHandle();
       }
       this._listeners = [];
    }

    ngAfterViewInit() {
      this.initialized = true;
    }

    setFullScreen() {
      if (!this.initialized) {
        setTimeout(() => {
          this.setFullScreen();
        }, 10);
        return;
      }

      if (this.isFullScreen) {
        this.enable();
      } else {
        this.cancel();
      }
    }

    enable() {
      let element = document.documentElement;
      if(element.requestFullScreen) {
        element.requestFullScreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
        // Safari temporary fix
        if (/Version\/[\d]{1,2}(\.[\d]{1,2}){1}(\.(\d){1,2}){0,1} Safari/.test(navigator.userAgent)) {
          element.webkitRequestFullscreen();
        } else {
          element.webkitRequestFullscreen(this.isKeyboardAvailbleOnFullScreen);
        }
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }

    cancel() {
      if(document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    isEnabled() {
        let fullscreenElement = document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
        return fullscreenElement ? true : false;
    }
}
