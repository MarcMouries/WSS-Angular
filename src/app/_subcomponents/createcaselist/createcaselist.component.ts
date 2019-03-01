import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../_services/case.service';
import { OpenAssignmentService } from '../../_messages/openassignment.service';
import { RefreshWorkListService } from '../../_messages/refreshworklist.service';
import { GetLoginStatusService } from '../../_messages/getloginstatus.service';
import { OpenNewCaseService } from '../../_messages/opennewcase.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-createcaselist',
  templateUrl: './createcaselist.component.html',
  styleUrls: ['./createcaselist.component.scss']
})
export class CreatecaselistComponent implements OnInit {


  caseManagement: any;
  caseTypes$: Array<any>;
  displayableCaseTypes$: Array<any>;
  subscription: Subscription;

  constructor(private cservice: CaseService, 
              private oaservice: OpenAssignmentService,
              private rwlservice: RefreshWorkListService,
              private glsservice: GetLoginStatusService,
              private oncservice: OpenNewCaseService) { 

    // if we have a user, get casetypes
    if (localStorage.getItem("userName")) {
      this.updateCaseTypes();
    }

  }

  ngOnInit() {
    this.subscription = this.glsservice.getMessage().subscribe(
      message => {
        if (message.loginStatus === 'LoggedIn') {
          this.updateCaseTypes();
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateCaseTypes() {
    this.cservice.getCaseTypes().subscribe(
      response => {

        this.caseManagement = response.body;
        this.caseTypes$ = this.caseManagement.caseTypes;
        this.displayableCaseTypes$  = new Array();

        for (var el in this.caseTypes$) {
          let myCase = this.caseTypes$[el];
          if (myCase.CanCreate == "true") {
            this.displayableCaseTypes$.push(myCase);
          }
        }

      },
      err => {
        alert("Errors from get casetypes:" + err.errors);
      }
    );

  }

  createCaseType(caseType: any) {
    if (caseType.startingProcesses[0].requiresFieldsToCreate === 'false') {
      // skip new
      this.cservice.createCase(caseType.ID, {}).subscribe(
        response => {
          // create a "row" that matches the worklist row, this way we can re-use
          // the open assignment service
          let row: any = {};
          let myCase: any = response.body;


          row["pxRefObjectKey"] = myCase.ID;
          row["pxRefObjectInsName"] = myCase.ID.split(" ")[1];
          row["pzInsKey"] = myCase.nextAssignmentID;

          this.oaservice.sendMessage(row.pxRefObjectInsName, row);
          this.rwlservice.sendMessage('Work');
         

        },
        err => {
          alert("Errors from create case:" + err.errors);
        }

      );
    }
    else {
      // new
      this.oncservice.sendMessage(caseType.ID);

    }


  }

}
