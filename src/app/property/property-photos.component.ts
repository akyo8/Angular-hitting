import { Component, ViewChild, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { PropertyService } from './property.service';
import { NotesService } from './notes.service';
import { ImageEditorMultiComponent } from '../imged/editor-multi.component';
import * as moment from 'moment/moment';

@Component({
  moduleId: module.id,
  selector: 'app-photo-addendum',
  templateUrl: 'property-photos.component.html',
  styleUrls: ['property.component.css']
})
export class PhotoAddendumComponent implements OnInit, AfterViewInit {
  propertyService: PropertyService;
  notesService: NotesService;
  @ViewChild('editorComp') editor: ImageEditorMultiComponent;
  private element: ElementRef;

  constructor(propertyService: PropertyService,
        notesService: NotesService,
        element: ElementRef) {
    this.propertyService = propertyService;
    this.notesService = notesService;
    this.element = element;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadPhotoAddendum();
  }

  doChange() {
    // Do nothing, just trigger update cycle
    return true;
  }

  initWithPhotos(annotatedPhotos) {
    let urls = this.propertyService.getCurrentProperty().resources.photos.highResUrls;
    let svg = [];

    for (let i = 0; i < urls.length; i++) {
      svg.push(null);
    }

    if (annotatedPhotos) {
      for (let photo of annotatedPhotos) {
        if (!photo.base || !photo.svg) {
          continue;
        }

        let foundIndex = urls.indexOf(photo.base);

        if (foundIndex >= 0) {
          svg[foundIndex] = photo.svg;
        }
      }
    }

    this.editor.initWith(urls, svg);
  }

  loadPhotoAddendum() {
    let bippoId = this.propertyService.getCurrentProperty().identifier.bippoId;
    this.notesService.getPhotoAddendum(bippoId,
      photos => {
        this.initWithPhotos(photos);
      },
      (error, cause) => {
        console.error('Error retreiving photo addendum for ' + bippoId, error);
        this.initWithPhotos(null);
      }
    );
  }

  savePhotoAddendum(editor) {
    let svg = editor._svg;
    let urls = editor._urls;

    if (!svg || !urls) {
       console.error('Unable to save photo addendum as generated svg and/or base url arrays were invalid.');
       return;
    }

    let payload = [];
    let len = Math.min(svg.length, urls.length);

    for (let i = 0; i < len; i++) {
      if (svg[i] && urls[i]) {
        // Valid index to save
        payload.push({
          base: urls[i],
          svg: svg[i]
        });
      }
    }

    console.log('Serialized ' + payload.length + ' SvgAnnotatedPhotos:', JSON.stringify(payload));
    let bippoId = this.propertyService.getCurrentProperty().identifier.bippoId;
    this.notesService.postPhotoAddendum({ bippoId: bippoId, photos: payload },
      () => {
        console.log('Successfully saved photo addendum for ' + bippoId);
      },
      (error, caught) => {
        console.error('Failed to save photo addendum for ' + bippoId, error);
      }
    );
  }

  exportPhotoAddendum(editor) {
    let count = 0;

    for (let i = 0; i < editor._urls.length; i++) {
      if (editor._urls[i] && editor._svg[i]) {
        count++;
      }
    }

    if (count < 1) {
      console.log('No marked images are present; cannot export PDF.');
      return;
    }

    editor.renderCompositeData(data => {
      if (!data || data.length < 1) {
        console.error('No data URIs were generated; cannot export PDF!');
        return;
      }

      let width = 792;
      let height = 612;
      let doc = new (<any>window).jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [ width, height ]
      });
      doc.setFontSize(12);

      // Create a PDF with four images per page
      for (let i = 0; i < data.length; i++) {
        let current = data[i];

        if (i > 3 && i % 4 == 0) {
          doc.addPage();
        }

        // Rotate through each position on the page
        let pos = i % 4;
        let x = pos % 2;
        let y = Math.floor(pos / 2);

        x = Math.floor(width / 4) + Math.floor(width / 2 * x);
        y = Math.floor(height / 4) + Math.floor(height / 2 * y);

        let w = width / 3;
        let h = height / 3;

        // Clamp the image to maintain aspect ratio and fit within the width / height
        if (w / h > current.width / current.height) {
          // Target area is wider than the source image, keep height and clamp width
          w = current.width / current.height * h;
        } else {
          // Target area is taller than the source image, keep width and clamp height
          h = current.height / current.width * w;
        }

        doc.addImage(current.uri, 'PNG', Math.floor(x - w / 2), Math.floor(y - h / 2), w, h);

        if (current.caption) {
          // If there is a caption for this image, render it
          doc.text(doc.splitTextToSize(current.caption, w), x, y + h / 2 + 24, null, null, 'center');
        }
      }

      doc.save('PhotoAddendum_Export.pdf');
    });
  }
}
