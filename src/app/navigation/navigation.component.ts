import { Component, OnInit } from '@angular/core';
import { GetLoginStatusService } from "../_messages/getloginstatus.service";
import { ChangeDetectorRef } from "@angular/core";
import { Subscription, Observable } from 'rxjs';
import { AssignmentService } from "../_services/assignment.service";
import { OpenAssignmentService } from "../_messages/openassignment.service";
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  bLoggedIn: boolean = false;
  userName$: string = "";
  subscription: Subscription;

  constructor(private glsservice: GetLoginStatusService, 
              private cdRef: ChangeDetectorRef,
              private aservice: AssignmentService,
              private oaservice: OpenAssignmentService,
              private snackBar: MatSnackBar) { }

  ngOnInit() {

    if (localStorage.getItem("userName")) {
      // if have a userName, then have already logged in
      this.bLoggedIn = true;

      this.userName$ = localStorage.getItem("userFullName");
    }


    this.subscription = this.glsservice.getMessage().subscribe(
        message => {
          if (message.loginStatus === 'LoggedIn') {
            this.bLoggedIn = true;
            this.userName$ = localStorage.getItem("userFullName");
          }
          else {
            this.bLoggedIn = false;
            localStorage.clear();
          }

          this.cdRef.detectChanges();
        }

    );

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getNextWork() {
    this.aservice.getAssignment("next").subscribe(
      assignmentResponse => {
        let nextWork : any = assignmentResponse.body;

        if (nextWork.ID && nextWork.ID != "") {

          let nextAssignment = {};
         
          let arCase = nextWork.caseID.split(" ");
          let currentCaseName = "GetNext";
          if (arCase.length > 1) {
            currentCaseName = arCase[1];
          }

          nextAssignment["pxRefObjectInsName"] = currentCaseName;
          nextAssignment["pxRefObjectKey"] = nextWork.caseID;
          nextAssignment["pzInsKey"] = nextWork.ID;

          this.oaservice.sendMessage(currentCaseName, nextAssignment);
          
        }
        else {
          let snackBarRef = this.snackBar.open("No next actions to go to", "Ok");
        }


      },
      assignmentError => {
        let snackBarRef = this.snackBar.open("Errors from get assignment:" + assignmentError.errors, "Ok");
      }
    );
  }

  logOff() {
    this.glsservice.sendMessage("LoggedOff");
    
  }

}
