import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute }  from '@angular/router';

declare let numeral:any;

@Component({
  moduleId: module.id,
  selector: 'app-image-editor-multi',
  templateUrl: 'editor-multi.component.html',
  styleUrls: ['editor.component.css']
})
export class ImageEditorMultiComponent implements OnInit {
  _urls: Array<string>;
  @Input()
  set urls(urls: Array<string>) {
    if (!urls || urls.length < 1) {
      return;
    }

    setTimeout(() => {
      this._svg = [];

      for (let i = 0; i < urls.length; i++) {
        this._svg.push(null);
      }

      this._urls = urls;
      this.initEditor();
    });
  }
  @Output() saveAll: EventEmitter<ImageEditorMultiComponent> = new EventEmitter<ImageEditorMultiComponent>();
  @Output() exportAll: EventEmitter<ImageEditorMultiComponent> = new EventEmitter<ImageEditorMultiComponent>();
  _svg: Array<string> = null;
  //propertyService: PropertyService;
  canvas: any = null;
  image: any = null;
  imageIndex: number = -1;
  mode: string = 'draw';
  lastColor: string = '#ff4444';
  caption: string = '';
  changing: boolean = false;
  blocking: boolean = false;
  textEditMode: boolean = false;

  constructor(private router: Router,
        private route: ActivatedRoute,
        private element: ElementRef) {
        //propertyService: PropertyService) {
    //this.propertyService = propertyService;
  }

  ngOnInit() {
  }

  initWith(urls: Array<string>, svg: Array<string>) {
    // Ensure parallel arrays, ideally they already are
    if (urls.length != svg.length) {
      if (svg.length > urls.length) {
        svg = svg.slice(0, urls.length);
      } else for (let i = svg.length; i < urls.length; i++) {
        svg.push(null);
      }
    }

    this._urls = urls;
    this._svg = svg;
    this.initEditor();
  }

  initEditor() {
    this.canvas = new (<any>window).fabric.Canvas('imged-multi-canvas', {
      width: 854,
      height: 480,
      isDrawingMode: true
    });
    this.canvas.on('before:selection:cleared', opt => {
      if (!this.textEditMode) {
        return;
      }

      let active = this.canvas.getActiveObject();

      if (active instanceof (<any>window).fabric.IText && (!active.text || !active.text.trim())) {
        this.canvas.remove(active);
      }
    });
    this.canvas.on('mouse:up', opt => {
      if (!this.textEditMode) {
        return;
      }

      let target = this.canvas.findTarget(opt.e);

      if (target instanceof (<any>window).fabric.IText) {
        this.canvas.setActiveObject(target);

        if (!target.isEditing) {
          target.enterEditing();
        }

        return;
      }

      let itext = new (<any>window).fabric.IText('', {
        top: opt.e.offsetY,
        left: opt.e.offsetX,
        fill: this.lastColor
      });
      this.canvas.add(itext);
      this.canvas.setActiveObject(itext);
      itext.enterEditing();
    });
    this.setBrushColor(null);
    this.setBrushWidth(null);
    this.nextImage();
  }

  triggerSaveAll() {
    this.changing = true;
    this.saveSvgIndex();
    this.saveAll.emit(this);
    this.changing = false;
  }

  triggerExportAll() {
    this.changing = true;
    this.saveSvgIndex();
    this.exportAll.emit(this);
    this.changing = false;
  }

  renderCompositeData(callback) {
    if (!callback) {
      return;
    }

    this.changing = true;
    this.blocking = true;
    this.toggleDrawingMode(true);

    // Call to have the first index rendered, it will recurse as needed
    this.renderCompositeDataIndex({
      into: [],
      formerIndex: this.imageIndex,
      afterCallback: callback
    }, 0);
  }

  renderCompositeDataIndex(ctx, idx) {
    if (idx > this._urls.length) {
      if (ctx.formerIndex >= 0 && this._urls[ctx.formerIndex]) {
        this.imageIndex = ctx.formerIndex;
        this.setImage(this._urls[ctx.formerIndex], () => {
          this.changing = false;
          this.blocking = false;
        });
        this.loadSvgIndex();
      } else {
        this.changing = false;
        this.blocking = false;
      }

      ctx.afterCallback(ctx.into);
      return;
    }

    if (this._urls[idx] && this._svg[idx]) {
      // Load image, export to data URI and then call next
      this.imageIndex = idx;
      this.setImage(this._urls[idx], () => {
        let processing = this.loadSvgIndex(() => {
          this.canvas.renderAll();

          let datauri = this.canvas.toDataURL();

          ctx.into.push({
            uri: datauri,
            index: idx,
            caption: this.getCaption(this._svg[idx]),
            width: this.image.getWidth(),
            height: this.image.getHeight()
          });
          this.renderCompositeDataIndex(ctx, idx + 1);
        });

        if (!processing) {
          // For some reason, nothing was processed; call next immediately
          this.renderCompositeDataIndex(ctx, idx + 1);
        }
      });
    } else {
      // Call next immediately
      this.renderCompositeDataIndex(ctx, idx + 1);
    }
  }

  prevImage() {
    if (this.changing || this.imageIndex - 1 < 0) {
      return;
    }

    this.changing = true;
    this.saveSvgIndex();
    this.setImage(this._urls[--this.imageIndex]);
    this.loadSvgIndex();
  }

  nextImage() {
    if (this.changing || this.imageIndex + 1 >= this._urls.length) {
      return;
    }

    this.changing = true;
    this.saveSvgIndex();
    this.setImage(this._urls[++this.imageIndex]);
    this.loadSvgIndex();
  }

  enterDrawingMode() {
    this.mode = 'draw';
    this.textEditMode = false;
    this.toggleDrawingMode(true);

    let remove = [];

    this.canvas.getObjects().map(o => {
      if (o instanceof (<any>window).fabric.IText) {
        if (!o.text || !o.text.trim()) {
          remove.push(o);
        }

        if (o.isEditing) {
          o.exitEditing();
        }
      }
    });

    for (let o in remove) {
      this.canvas.remove(o);
    }

    this.canvas.discardActiveGroup().discardActiveObject().renderAll();
  }

  enterSelectionMode() {
    this.mode = 'sel';
    this.textEditMode = false;
    this.toggleDrawingMode(false);
    this.canvas.selection = true;

    let remove = [];

    this.canvas.getObjects().map(o => {
      if (o instanceof (<any>window).fabric.IText) {
        if (!o.text || !o.text.trim()) {
          remove.push(o);
        }

        if (o.isEditing) {
          o.exitEditing();
        }
      }

      o.set({ selectable: !(o instanceof (<any>window).fabric.Image) });
    });

    for (let o in remove) {
      this.canvas.remove(o);
    }

    this.canvas.discardActiveGroup().discardActiveObject().renderAll();
  }

  enterTextMode() {
    this.mode = 'text';
    this.textEditMode = true;
    this.toggleDrawingMode(false);
    this.canvas.selection = false;

    this.canvas.getObjects().map(o => {
      if (o instanceof (<any>window).fabric.IText && o.isEditing) {
        o.exitEditing();
      }

      o.set({ selectable: (o instanceof (<any>window).fabric.IText) });
    });
    this.canvas.discardActiveGroup().discardActiveObject().renderAll();
  }

  toggleDrawingMode(state) {
    if ("undefined" === typeof state) {
      this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
    } else {
      this.canvas.isDrawingMode = state;
    }

    if (this.image) {
      this.image.set({
        opacity: this.canvas.isDrawingMode ? 1.0 : 0.5
      });
      this.canvas.renderAll();
    }
  }

  deleteSelection() {
    let group = this.canvas.getActiveGroup();

    if (group) {
      group.forEachObject(o => this.canvas.remove(o));
      this.canvas.discardActiveGroup().renderAll();
    } else {
      this.canvas.remove(this.canvas.getActiveObject());
    }
  }

  clearCanvas() {
    if (this.image) {
      this.canvas.remove(this.image);
    }

    this.canvas.clear();

    if (this.image) {
      this.canvas.add(this.image);
      this.canvas.sendToBack(this.image);
    }
  }

  setImage(url, after = () => { this.changing = false; }, errored = null) {
    if (this.image) {
      this.canvas.remove(this.image);
      this.image = null;
    }

    this.clearCanvas();

    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url + '?' + Date.now();
    img.onerror = () => {
      console.error('Failed to load image to pass to fabricjs');

      if (errored) {
        errored();
      }
    };
    img.onload = () => {
      let fabricimg = new (<any>window).fabric.Image(img, {
        selectable: false,
        opacity: this.canvas.isDrawingMode ? 1.0 : 0.5
      });
      this.setCanvasSize(fabricimg.getWidth(), fabricimg.getHeight());
      this.image = fabricimg;
      this.canvas.add(fabricimg);
      this.canvas.sendToBack(fabricimg);

      if (after) {
        after();
      }
    };
  }

  setBrushColorEvent(e) {
    if (e && e.srcElement && e.srcElement.value) {
      this.setBrushColor(e.srcElement.value);
    }
  }

  setBrushColor(hex) {
    this.canvas.freeDrawingBrush.color = this.lastColor = hex || "#FF4444";
  }

  setBrushWidth(w) {
    this.canvas.freeDrawingBrush.width = w || 8;
  }

  setCanvasSize(w, h) {
    this.canvas.setWidth(w);
    this.canvas.setHeight(h);
    this.canvas.calcOffset();
  }

  serializeToSvg() {
    if (this.image) {
      this.canvas.remove(this.image);
    }

    let objects = this.canvas.getObjects();

    if (!objects || objects.length < 1) {
      if (this.caption && this.caption.trim()) {
        return '<!--' + this.caption.trim().replace('-', '&#45;') + '-->';
      }

      return null;
    }

    let svg = this.canvas.toSVG();

    if (this.image) {
      this.canvas.add(this.image);
      this.canvas.sendToBack(this.image);
    }

    if (this.caption && this.caption.trim()) {
      svg += '<!--' + this.caption.trim().replace('-', '&#45;') + '-->';
    }

    return svg;
  }

  deserializeFromSvg(svg, callback = null) {
    this.clearCanvas();

    if (!svg) {
      this.caption = '';
      return false;
    }

    let comment = svg.lastIndexOf('<!--');

    if (comment >= 0) {
      this.caption = (svg.substring(comment + 4, svg.indexOf('-->', comment)) || '').replace('&#45;', '-');
      svg = svg.substring(0, comment);

      if (svg.length < 1) {
        if (callback) {
          callback();
        }

        return true;
      }
    } else {
      this.caption = '';
    }

    (<any>window).fabric.loadSVGFromString(svg, (objects, options) => {
      let grouped = (<any>window).fabric.util.groupSVGElements(objects, options);
      this.canvas.add(grouped).renderAll();

      if (callback) {
        callback();
      }
    });

    return true;
  }

  saveSvgIndex() {
    if (this.imageIndex >= 0 && this.imageIndex < this._svg.length) {
      let svg = this.serializeToSvg();

      if (svg) { // Ensure there is actually svg data stored in the generated svg document
        this._svg[this.imageIndex] = svg;
      }
    }
  }

  loadSvgIndex(callback = null) {
    if (this.imageIndex >= 0 && this.imageIndex < this._svg.length) {
      let svg = this._svg[this.imageIndex];

      if (svg) {
        return this.deserializeFromSvg(svg, callback);
      }
    }

    return false;
  }

  getCaption(svg) {
    if (!svg) {
      return null;
    }

    let comment = svg.lastIndexOf('<!--');

    if (comment < 0) {
      return null;
    }

    return (svg.substring(comment + 4, svg.indexOf('-->', comment)) || '').replace('&#45;', '-');
  }
}
