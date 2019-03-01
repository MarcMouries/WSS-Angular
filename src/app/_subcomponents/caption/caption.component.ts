import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-caption',
  templateUrl: './caption.component.html',
  styleUrls: ['./caption.component.scss']
})
export class CaptionComponent implements OnInit {


  @Input() captionComp: any;
  @Input() fg: FormGroup;

  captionValue$: string;
  captionFormat$: string;

  constructor() { 

  }

  ngOnInit() {

    this.captionValue$ = this.captionComp.value;
    // replace spaces with "-"
    this.captionFormat$ = this.captionComp.control.format.replace(/\s/gi, "-");


  }

}
