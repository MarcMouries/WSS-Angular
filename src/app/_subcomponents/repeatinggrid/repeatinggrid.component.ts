import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RefreshAssignmentService } from '../../_messages/refreshassignment.service';

@Component({
  selector: 'app-repeatinggrid',
  templateUrl: './repeatinggrid.component.html',
  styleUrls: ['./repeatinggrid.component.scss']
})
export class RepeatinggridComponent implements OnInit {

  @Input() layoutComp: any;
  @Input() formGroup: FormGroup;
  @Input() CaseID: string;

  repeatHeader$: any;
  repeatRows$: any;

  constructor(private raservice: RefreshAssignmentService) { 

  }

  ngOnInit() {
    this.repeatHeader$ = this.layoutComp.header.groups;
    this.repeatRows$ = this.layoutComp.rows;

  }


  addRow() {

   if (this.layoutComp.referenceType === "List") {
      // list
      let addRowData = { 'rowNum': '', 'layoutData': this.layoutComp };
      this.raservice.sendMessage("addRow", addRowData);
    }
    else {
      // group
      let rowName = prompt("Row name to add", "");

      let addGroupData = { 'rowName': rowName, 'layoutData': this.layoutComp};
      this.raservice.sendMessage("addRow", addGroupData);

    }
  }

  removeRow() {
    if (this.layoutComp.referenceType === "List") {
      // list
      let removeRowData = { 'rowNum': '', 'layoutData': this.layoutComp };
      this.raservice.sendMessage("removeRow", removeRowData);

    }
    else {
      // group
      let rowName = prompt("Row name to remove", "");

      let removeGroupData = { 'rowName': rowName, 'layoutData': this.layoutComp };
      this.raservice.sendMessage("removeRow", removeGroupData);

    }
  }
}
