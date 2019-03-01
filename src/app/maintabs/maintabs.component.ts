import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OpenAssignmentService } from '../_messages/openassignment.service';
import { GetAssignmentService } from '../_messages/getassignment.service';
import { CloseWorkService } from '../_messages/closework.service';
import { interval } from "rxjs/internal/observable/interval";
import { OpenNewCaseService } from '../_messages/opennewcase.service';
import { GetNewCaseService } from '../_messages/getnewcase.service';
import { RenameTabService } from '../_messages/renametab.service';
import { OpenRecentService } from '../_messages/openrecent.service';
import { GetRecentService } from "../_messages/getrecent.service";

@Component({
  selector: 'app-maintabs',
  templateUrl: './maintabs.component.html',
  styleUrls: ['./maintabs.component.scss']
})


// 
// app-maintabs component creates a new tab for most of the "open" messages
// Typically a new tab is created, when the componet gets the message that the tab
// has been created, this component will send the corresponding "get" message.  
// Usually the component inside the tab is an app-workitem, which will register for
// the "get" message and populate itself appropriately
//


export class MaintabsComponent implements OnInit {

  message: any;
  subscription: Subscription;

  isNewCase: boolean = false;

  closeWorkMessage: any;
  closeWorkSubscription: Subscription;

  openNewCaseMessage: any;
  openNewCaseSubscrption: Subscription;

  renameTabMessage: any;
  renameTabSubscription: Subscription;

  openRecentMessage: any;
  openRecentSubscription: Subscription;

  constructor(private oaService: OpenAssignmentService, 
              private gaService: GetAssignmentService,
              private cwService: CloseWorkService,
              private oncService: OpenNewCaseService,
              private gncService: GetNewCaseService,
              private rtService: RenameTabService,
              private orService: OpenRecentService,
              private grService: GetRecentService ) { 

    this.subscription = this.oaService.getMessage().subscribe(message => { 

      this.message = message;
      this.addTab(message.caseID, message.assignment);
    });

    this.closeWorkSubscription = this.cwService.getMessage().subscribe(message => { 

      this.closeWorkMessage = message;
      let tabIndex = this.tabs.indexOf(this.closeWorkMessage.workID);

      this.removeTab(tabIndex);
    });

    this.openNewCaseSubscrption = this.oncService.getMessage().subscribe(
      message => {
        this.openNewCaseMessage = message;

        this.isNewCase = true;
        this.addTab("New", null);
      }
    );

    this.renameTabSubscription = this.rtService.getMessage().subscribe(
      message => {
        this.renameTabMessage = message;

        this.renameTab(this.renameTabMessage.tabName, this.renameTabMessage.newTabName);
      }
    );

    this.openRecentSubscription = this.orService.getMessage().subscribe(
      message => {
        this.openRecentMessage = message;

        this.addTab(message.caseName, null);
      }
    );


  }

  tabs = ['Dashboard'];
  selected = new FormControl(0, null);


  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked() {
    // called after the tab has been created
    // then we want to send the appropriate message (usally to app-workitem) to populate

    if (this.message) {

      if (!this.isNewCase) {
        this.gaService.sendMessage(this.message.assignment.pxRefObjectInsName, this.message.assignment);
        
        this.message = null;
      }
    }
    else if (this.openNewCaseMessage) {
      if (this.isNewCase) {
        this.isNewCase = false;

        this.gncService.sendMessage(this.openNewCaseMessage.caseID);
      }
    }
    else if (this.openRecentMessage) {
      if (!this.isNewCase) {
        this.grService.sendMessage(this.openRecentMessage.caseID);
      }
    }
  }

  addTab( sTabName : string, assignment : Object) {
    if (this.tabs.indexOf(sTabName) == -1 ) {
      this.tabs.push(sTabName);

      // have to select the tab after it is created
      var timer = interval(100).subscribe(() => {
        this.selected.setValue(this.tabs.length-1);timer.unsubscribe();
        });
    
    }
    else {
      this.selected.setValue(this.tabs.indexOf(sTabName));
    }


  }


  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  renameTab(tabName: string, newTabName: string) {

    let tabIndex = this.tabs.indexOf(tabName);
    if (tabIndex >= 0) {
      this.tabs[tabIndex] = newTabName;
    }
  }

}
