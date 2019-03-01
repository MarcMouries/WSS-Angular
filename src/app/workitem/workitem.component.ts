import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { GetAssignmentService } from '../_messages/getassignment.service';
import { GetViewService } from '../_messages/getview.service';
import { GetPageService } from '../_messages/getpage.service';
import { GetChangesService } from '../_messages/getchanges.service';
import { AssignmentService } from '../_services/assignment.service';
import { CaseService } from '../_services/case.service';
import { CloseWorkService } from '../_messages/closework.service';
import { ChangeDetectorRef } from "@angular/core";
import { interval } from "rxjs/internal/observable/interval";
import { TopviewComponent } from '../_subcomponents/topview/topview.component';
import { ReferenceHelper } from '../_helpers/reference-helper';
import { PegaErrors } from '../_constants/PegaErrors';
import { MatSnackBar } from '@angular/material';
import { GetActionsService } from '../_messages/getactions.service';
import { RefreshWorkListService } from '../_messages/refreshworklist.service';
import { RefreshCaseService } from '../_messages/refreshcase.service';
import { RefreshAssignmentService } from '../_messages/refreshassignment.service';
import { GetNewCaseService } from '../_messages/getnewcase.service';
import { ToppageComponent } from '../_subcomponents/toppage/toppage.component';
import { RenameTabService } from '../_messages/renametab.service';
import { OpenAssignmentService } from '../_messages/openassignment.service';
import { GetRecentService } from '../_messages/getrecent.service';
import { GetCaseService } from '../_messages/getcase.service';



@Component({
  selector: 'app-workitem',
  templateUrl: './workitem.component.html',
  styleUrls: ['./workitem.component.scss'],
  providers: [ReferenceHelper]
})

//
// app-workitem is the component that does the most work
// it registers for a lot of messages from other components and handles them
// there is an app-workitem component for each open case (one per tab)
// typically, the app-tab component will be created and then send a message
// to the app-workitem to populate.
//

export class WorkitemComponent implements OnInit {

  @ViewChild(TopviewComponent) tvComp: TopviewComponent;
  @ViewChild(ToppageComponent) tpComp: ToppageComponent;

  message: any;
  subscription: Subscription;
  
  changeMessage: any;
  changeSubscription: Subscription;

  actionMessage: any;
  actionSubscription: Subscription;

  refreshAssignmentMessage: any;
  refreshAssignmentSubscription: Subscription;

  getNextWorkMessage: any;
  getNextWorkSubscription: Subscription;

  getNewCaseMessage: any;
  getNewCaseSubscription: Subscription;

  getRecentMessage: any;
  getRecentSubscription: Subscription;

  getStateMessage: any;
  getStateSubscription: Subscription;

  requestStateMessage: any;
  requestStateSubscription: Subscription;

  currentAssignment$: Object;
  currentAssignmentFields$: Object;
  currentAction: string;
  currentAssignmentID: string;

  currentView$: Object;
  currentPage$: any;

  currentCase$: Object;
  currentCaseLoaded$: boolean = false;

  localActions$: Array<any> = new Array();
  assignmentActions$: Array<any> = new Array();

  topName$: string;

  currentCaseID$: string;
  currentCaseName: string;

  aheaders: any;
  cheaders: any;
  errors: any;
  etag: string;

  isLoaded: boolean = false;
  isProgress: boolean = true;
  isView: boolean = false;
  isPage: boolean = false;
  isNewPage: boolean = false;
  currentPageID$: string;

  state: Object = new Object();


  constructor(private aservice: AssignmentService,
    private cservice: CaseService,
    private gaservice: GetAssignmentService, 
    private cdref: ChangeDetectorRef, 
    private gvservice: GetViewService,
    private gpservice: GetPageService,
    private gchservice: GetChangesService,
    private refHelper: ReferenceHelper,
    private snackBar: MatSnackBar,
    private gactionsservice: GetActionsService,
    private cwservice: CloseWorkService,
    private rwlservice: RefreshWorkListService,
    private rcservice: RefreshCaseService,
    private raservice: RefreshAssignmentService,
    private gncservice: GetNewCaseService,
    private rtservice: RenameTabService,
    private oaservice: OpenAssignmentService,
    private grservice: GetRecentService,
    private gcservice: GetCaseService) {

    this.subscription = this.gaservice.getMessage().subscribe(message => { 
      this.message = message;
      this.currentCaseName = this.message.caseID;

      this.getAssignment(message.assignment.pzInsKey);

      this.handleUnsubscribe();
    });

    this.changeSubscription = this.gchservice.getMessage().subscribe(message => { 
      this.changeMessage = message;

      this.updateState(this.changeMessage.ref, this.changeMessage.value, this.changeMessage.caseID);
    });

    this.actionSubscription = this.gactionsservice.getMessage().subscribe(message => { 
      this.actionMessage = message;

      this.handleFormActions(this.actionMessage.actionName, this.actionMessage.action, this.actionMessage.caseID);
    });

    this.refreshAssignmentSubscription = this.raservice.getMessage().subscribe(message => { 
      this.refreshAssignmentMessage = message;

      this.handleRefreshAssignmentActions(this.refreshAssignmentMessage.action, this.refreshAssignmentMessage.data);
    });

    this.getNewCaseSubscription = this.gncservice.getMessage().subscribe(message => { 
      this.getNewCaseMessage = message;

      this.getNewCase(message.caseID);

      this.handleUnsubscribe();
    });
    
    this.getRecentSubscription = this.grservice.getMessage().subscribe(
      message => {
        this.getRecentMessage = message;

        this.getRecent(message.caseID);

        this.handleUnsubscribe();

      }
    );




  }

  ngOnInit() {
    

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.changeSubscription.unsubscribe();
    this.getNewCaseSubscription.unsubscribe();
    this.getRecentSubscription.unsubscribe();
    this.actionSubscription.unsubscribe();
    
  }



  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }


  handleUnsubscribe() {
    this.subscription .unsubscribe();
    this.getNewCaseSubscription.unsubscribe();
    this.getRecentSubscription.unsubscribe();
  }

  handleFormActions(sAction: string, oAction: any, caseID: string) {

    if (caseID === this.currentCaseID$) {

      switch(sAction){
        case "refresh": 
          this.refreshView(this.state, oAction);
          break;
        case "postValue":
          break;
        case "runScript":
          let sScript = this.getRunScript(oAction);

          try {
            eval(sScript);
          }
          catch (ex) {
            console.log("RunScript can't eval: " + sScript + ", function may not exist.");
          }

          break;
        case "takeAction": 
          this.takeAction(oAction.actionProcess.actionName);
          break;
        case "setValue":
          this.setValueOnPairs(oAction.actionProcess.setValuePairs, caseID);
          break;
        case "openUrlInWindow":
          this.openUrlInWindow(oAction.actionProcess);
          break;
        default: 
          console.log("unhandled action:" + sAction);
          break;
      }
    }

  }

  handleRefreshAssignmentActions(sAction, oAction: any) {
    switch(sAction) {
      case "addRow" :
        let postContentAdd = this.refHelper.getPostContent(this.state);
        let targetAdd = this.refHelper.getRepeatFromReference(oAction.layoutData.reference, oAction.layoutData.referenceType, postContentAdd);

        if (oAction.layoutData.referenceType === 'List') {
          targetAdd.push(this.refHelper.getBlankRowForRepeat(targetAdd));
        }
        else {
          // group
          if (oAction.rowName === null || oAction.rowName === "") {
            return;
          }

          targetAdd[oAction.rowName] = {};
        }

        this.refreshView(postContentAdd, oAction);

        break;
      case "removeRow" :
        let postContentRemove = this.refHelper.getPostContent(this.state);
        let targetRemove = this.refHelper.getRepeatFromReference(oAction.layoutData.reference, oAction.layoutData.referenceType, postContentRemove);

        if (oAction.layoutData.referenceType === 'List') {
          

          if (targetRemove.length > 1) {
            targetRemove.pop();
          }
          else {
            // get a clear row
            let blankRow = this.refHelper.getBlankRowForRepeat(targetRemove);
            targetRemove.pop();
            targetRemove.push(blankRow);
          }


        }
        else {
          // group
          if (oAction.rowName === null || oAction.rowName === "") {
            return;
          }

          if (targetRemove[oAction.rowName]) {
            delete targetRemove[oAction.rowName];
          }
        }

        this.refreshView(postContentRemove, oAction);

        break;
    }

  }



  takeAction(sAction: string) {
    this.getNextAssignment(this.currentAssignmentID, sAction, this.currentCaseID$);
  }

  setValueOnPairs(valuePairs: Array<any>, sCaseID: string) {

    if (sCaseID === this.currentCaseID$) {
      for (let pairs of valuePairs){
        let ref = pairs.name;
        if (ref.indexOf(".") == 0) {
          ref = ref.substring(1);
        }

        let paramValue = "";
        if (pairs.value != undefined) {
          paramValue = this.determineParam(pairs.value);
        }
        else if (pairs.valueReference != undefined) {
          paramValue = this.determineParamRef(pairs.valueReference);
        }

        paramValue = this.removeLeadingTrailingQuotes(paramValue);

        // update the state
        this.updateState(ref, paramValue, sCaseID);

        // update the assignment, so will be displayed
        // if no assignment, nothing will happen
        this.updateAssignmentView(ref, paramValue);
      }
    }
  }
  
  openUrlInWindow(oData) {


    // remove quotes,

    try {



      // create url
      let oAlternateDomain = oData.alternateDomain;
      let url = "";
      if (oAlternateDomain.url != undefined) {
        url = oAlternateDomain.url;
        if (url.indexOf('"') == 0) {
          url = url.replace(/\"/gi, "");
        }  
      }
      else if (oAlternateDomain.urlReference != undefined) {
        url = this.determineParamRef(oAlternateDomain.urlReference);
        url = url.replace(/\"/gi, "");
      }

      // check if have query params
      let sQuery = this.getQueryParams(oData.queryParams);

      if (sQuery != "") {
        url += sQuery;
      }

      // if doesn't begin with http, add it
      if (url.indexOf("http") != 0) {
        url = "http://" + url;
      }
      window.open(url, oData.windowName, oData.windowOptions);
    }
    catch (ex) {
      console.log("Bad open url");
    }

  }

  getQueryParams(arQueryParams): string {
    let sReturn = "";

    let bFirst: boolean = true;
    if (arQueryParams.length > 0) {
      for (let qParam of arQueryParams) {
        if (bFirst) {
          sReturn += "?";
          bFirst = false;
        }
        else {
          sReturn += "&";
        }
        sReturn += qParam.name + "=";

        let sVal = "";
        if (qParam.value != undefined) {
          sVal = this.determineParam(qParam.value);
        }
        else if (qParam.valueReference != undefined) {
          sVal = this.determineParamRef(qParam.valueReference);
        }
        if (sVal.indexOf('"') == 0) {
          sVal = sVal.replace(/\"/gi, "");
        }  

        sReturn += sVal;
      }


    }

    return sReturn;
  }


  removeLeadingTrailingQuotes(sValue) {
    if (sValue.indexOf('"') == 0) {
      sValue = sValue.substring(1);
    }

    if (sValue.indexOf('"') == (sValue.length - 1)) {
      sValue = sValue.substring(0, sValue.length - 1);
    }

    return sValue;
  }

  getRunScript(oAction): string {

    let sReturn: string = oAction.actionProcess.functionName + "(";
    let bFirst = true;
    for (let param of oAction.actionProcess.functionParameters) {
      if (!bFirst) {
        sReturn += ",";
      }
      bFirst = false;

      if (param.value != undefined) {
        sReturn += this.determineParam(param.value);
      }
      else if (param.valueReference != undefined) {
        sReturn += this.determineParamRef(param.valueReference);
      }
    }

      sReturn += ")";

      return sReturn;
  }

  determineParam(param: any) {
    if (typeof(param) == "boolean") {
      return param;
    }
    else if (param.indexOf('"') == 0) {
        return param;
    }
    else if (param.indexOf(".") >= 0) {
      // look up
      return '"' + this.lookUpParam(param, false) + '"';

    }
    else {
      return '"' + param + '"';
    }
  }

  determineParamRef(paramRef: any) {
    let paramValue = this.lookUpParam(paramRef.reference, true); 

    if (paramValue === undefined) {
      paramValue = paramRef.lastSavedValue;
    }

    return '"' + paramValue + '"';


  }

  lookUpParam(param: any, bReturnUndefined : boolean): string {
    let arNodes: Array<string> = param.split(".");
    let returnString: string;

    let stateNode = this.state;
    // first try in state
    for (let nodeEl of arNodes) {
      if (nodeEl != "" && stateNode != undefined ) {
        if (typeof(stateNode[nodeEl]) == "object") {
          stateNode = stateNode[nodeEl];
        }
        else if ( stateNode[nodeEl] === undefined) {
          break;
        }
        else {
          returnString = stateNode[nodeEl];
        }

      }
    }

    if (returnString === undefined) {

      // try "content" (pyWorkPage)
      let currNode = this.currentCase$["content"];

      for (let nodeEl of arNodes) {
        if (nodeEl != "" && currNode != undefined ) {
          if (typeof(currNode[nodeEl]) == "object") {
            currNode = currNode[nodeEl];
          }
          else if (currNode[nodeEl] === undefined) {
            break;
          }
          else {
            returnString = currNode[nodeEl];
          }
  
        }
      }

    }

    if (returnString === undefined && !bReturnUndefined) {
      returnString = "";
    }

    return returnString;

  }


  getAssignment(assignmentID: string) {

    this.aservice.getAssignment(assignmentID).subscribe(
      assignmentResponse => {
        this.currentAssignment$ = assignmentResponse.body;
        
        let nextAssignment : any = this.currentAssignment$;


        if (nextAssignment.actions.length > 0) {
          // get first flow action
          let nextAction = nextAssignment.actions[0].ID;

          this.currentCaseID$ = nextAssignment.caseID;
          
          let arCase = nextAssignment.caseID.split(" ");

          // now
          //this.aservice.getFieldsForAssignment(action.nextAssignmentID, nextAction).subscribe()

          this.getNextAssignment(nextAssignment.ID, nextAction, nextAssignment.caseID);
        }
        else {
          let assignmentID = "No assigment";
          let caseName = "";
          try {
            assignmentID = nextAssignment.ID;
            let arCase = nextAssignment.caseID.split(" ");
            if (arCase.length > 1) {
              caseName = arCase[1];
              this.currentCaseName = caseName;
            }            
          }
          catch {
          }

          let sError = "Assignment " + assignmentID + " can not be opened.";

          let snackBarRef = this.snackBar.open(sError, "Ok");

          this.closeWork();
        }


      },
      assignmentError => {
        let snackBarRef = this.snackBar.open("Errors from get assignment:" + assignmentError.errors, "Ok");
      }
    );

  }



  getNextAssignment(assignmentID: string, action: string, caseID: string) {

    // go get the assignment
    this.aservice.getFieldsForAssignment(assignmentID, action).subscribe(
      response => { 
        this.currentAssignmentFields$ = response.body;
        this.aheaders = response.headers;
        this.currentAction = action;
        this.currentAssignmentID = assignmentID;


        this.isView = true;
        this.isPage = false;
        this.isNewPage = false;

        this.getView(this.currentAssignmentFields$);

        this.updateActionDropDown(action);

      },
      err => {
        let snackBarRef = this.snackBar.open("Errors from assignment:" + err.message, "Ok");
        
      }

    )


    // go get the case (needed for etag)
    this.cservice.getCase(caseID).subscribe(
      response => {

        this.currentCase$ = response.body;
        this.cheaders = response.headers;
        this.currentCaseLoaded$ = true;



        // add etag to the data
        //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
        this.etag = response.headers.get("etag").replace(/\"/gi, '');

        this.gcservice.sendMessage(this.currentCase$);

        this.cdref.detectChanges();
        
      },
      err => {
        let snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
      }

    );


    this.subscription.unsubscribe();

  }



  getCase(caseID: string) {
    // go get the case (needed for etag)
    this.cservice.getCase(caseID).subscribe(
      response => {
        
        this.currentCase$ = response.body;
        this.cheaders = response.headers;
        this.currentCaseLoaded$ = true;

        // add etag to the data
        //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
        this.etag = response.headers.get("etag").replace(/\"/gi, '');

        this.cdref.detectChanges();

        this.rwlservice.sendMessage('Work');


        this.gcservice.sendMessage(this.currentCase$);
        
      },
      err => {
        let snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
      }  
    );
  }

  getNewCase(caseID: string) {

    this.cservice.getCaseCreationPage(caseID).subscribe(
      response => {
        // creation_page in response.body.creation_page


        this.isView = false;
        this.isPage = false;
        this.isNewPage = true;

  
        this.isProgress = false;
        this.isLoaded = true;

        this.currentCaseLoaded$ = true;

        this.currentCaseID$ = response.body["caseTypeID"];
        this.currentPage$= response.body["creation_page"];
        this.currentPageID$ = this.currentPage$["pageID"];
        this.cheaders = response.headers;
        this.currentCaseLoaded$ = true;

        // add etag to the data
        //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
        //this.etag = response.headers.get("etag").replace(/\"/gi, '');

        this.cdref.detectChanges();
        
        //this.getCase(this.currentCaseID$);
        this.getPage(this.currentPage$);

        // need to fake a case - look at what a real case looks like and fake it, add in a single breadcrumb (right now bc off)


       

      },
      err => {
        let snackBarRef = this.snackBar.open("Errors from create case:" + err.message, "Ok");
      }

    );

  }

  getView(oAssignment: any) {
    this.currentView$ = oAssignment.view;
    this.topName$ = oAssignment.name;
    this.isProgress = false;
    this.isLoaded = true;
   
    this.currentCaseID$ = oAssignment.caseID;

    var timer = interval(10).subscribe(() => {
      this.gvservice.sendMessage(this.topName$, this.currentCaseID$, this.currentView$);timer.unsubscribe();
      });

    this.state = this.refHelper.getInitialValuesFromView(this.currentView$);

    // handle top view validation messages
    if (this.currentView$["validationMessages"] != "") {
      let snackBarRef = this.snackBar.open(this.currentView$["validationMessages"], "Ok");
    }
  

  }

  getPage(oPage: any) {


    var timer = interval(10).subscribe(() => {
      this.gpservice.sendMessage(oPage.name, oPage.pageID, oPage);timer.unsubscribe();
      });

    this.state = this.refHelper.getInitialValuesFromView(oPage);

  }

  getRecent(caseID: string) {

    this.cservice.getCase(caseID).subscribe(
      response => {

        this.currentCase$ = response.body;

        let firstAssignment = this.currentCase$["assignments"][0];
        let assignmentID = firstAssignment.ID;
        let firstAction = firstAssignment["actions"][0];
        let actionID = firstAction.ID;

        this.getNextAssignment(assignmentID, actionID, caseID);


        
      },
      err => {
        let snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
      }

    );
  }

  updateState(sRef, sValue, sCaseID) {

    if (sCaseID === this.currentCaseID$) {
      this.state[sRef] = sValue;
    }

  }

  updateAssignmentView(sRef, sValue) {

    if (this.currentAssignmentFields$) {
      let fieldNode = this.refHelper.customUpdateJSON(this.currentAssignmentFields$, "reference", sRef);
      if (fieldNode) {
        fieldNode.value = sValue;
      }
    }

  }




  refreshView(stateData: any, oAction: any) {
  
    let sRefreshFor = "";
    if (stateData == null) {
      stateData = {};
    }

    if (oAction) {
      if (oAction.refreshFor) {
        sRefreshFor = oAction.refreshFor;
      }
    }
  
    this.aservice.performRefreshOnAssignment(this.currentAssignmentID, this.currentAction, sRefreshFor, stateData).subscribe(
      response => {
        this.currentAssignmentFields$ = response.body;
        this.aheaders = response.headers;
        //alert(JSON.stringify(this.currentAssignmentFields$));
        //this.currentAction = this.currentAction;
        //this.currentAssignmentID = assignmentID;

        this.getView(this.currentAssignmentFields$);

        this.rcservice.sendMessage(this.currentCaseID$);

      },
      err => {
        this.handleErrors(err);
      }

    );



  }

  closeWork() {
    this.cwservice.sendMessage(this.currentCaseName);

  }



  submitView() {
    // submit the form if it passes and is valid
    if (this.tvComp.formValid()) {

      this.isProgress = true;

      this.state = this.refHelper.removeDataPages(this.state);

      this.aservice.performActionOnAssignment(this.currentAssignmentID, this.currentAction, this.state ).subscribe(
        response => {
          let action: any = response.body;
          if (action && action.nextAssignmentID) {
            this.isPage = false;
            this.isView = true;
            this.isNewPage = false;

            this.getAssignment(action.nextAssignmentID);

            this.rcservice.sendMessage(this.currentCaseID$);
  
          }
          else if (action && action.nextPageID) {
            // have a page (Confirm/Review)
            this.currentPageID$ = action.nextPageID;
  
            this.isProgress = false;
            this.isPage = true;
            this.isView = false;
            this.isNewPage = false;
            this.cdref.detectChanges();

            this.getCase(this.currentCaseID$);

            this.rcservice.sendMessage(this.currentCaseID$);
  
          }
          else {
            this.isProgress = false;
            alert("something else:" + JSON.stringify(action));
          }
  
        },
        err => {
          this.isProgress = false;
          this.handleErrors(err);
        }
      );
  
      this.subscription.unsubscribe();

    }


  }

  saveView() {
    
    // submit the form if it passes and is valid
    if (this.tvComp.formValid()) {

      this.isProgress = true;

      this.cservice.updateCase(this.currentCaseID$, this.etag, null, this.state).subscribe(
        response => {
          switch (response.status) {
            case 200 :
            case 204 :
              // good, so reload 
              this.getAssignment(this.currentAssignmentID);

              this.rcservice.sendMessage(this.currentCaseID$);
              break;
            default:
              break;
          }
        },
        err => {
          this.isProgress = false;
          this.handleErrors(err);
        }
      );
    
    }
  }

  createNew() {
    if (this.tpComp.formValid()) {

      this.isProgress = true;
      
      this.cservice.createCase(this.currentCaseID$, this.state).subscribe(
        response => {


          let caseID = response.body["ID"];
          let caseName = caseID.split(" ")[1];

          let oAssignment = new Object();
          oAssignment["pxRefObjectInsName"] = caseName;
          oAssignment["pzInsKey"] = response.body["nextAssignmentID"];

          // renaming tab
          this.rtservice.sendMessage("New", caseName);

          // so renaming the tab, causes the tab to reload
          // so we need to send it a message to open the assigment, because
          // it lost it with the reload
          this.oaservice.sendMessage(caseName, oAssignment);

          // new item created, update worklist
          this.rwlservice.sendMessage('Work');



        },
        err => {
          this.isProgress = false;
          this.handleErrors(err);
        }
      );

    }

  }

  updateActionDropDown(currentAction: string ) {
    let actions = this.currentAssignment$["actions"];

    this.localActions$ = new Array();
    this.assignmentActions$ = new Array();

    for (let action of actions) {
      if (action.type === "Assignment") {
        if (action.ID != currentAction) {
          this.assignmentActions$.push(action);
        }
      }
      else {
        this.localActions$.push(action);
      }
    }

  }

  // handle local action
  // we don't support them right now
  handleLocalAction(sAction: string) {
    let snackBarRef = this.snackBar.open("Unsupported Action: " + sAction, "Ok");
  }


  // if there are other assignments you can jump to, handle them here
  handleAssignmentAction(sAction: string) {
    this.getNextAssignment(this.currentAssignmentID, sAction, this.currentCaseID$);
  }

  // handle the "err" object
  handleErrors(errorResponse: any) {

    if (errorResponse.error) {
      let error: any;
      let sErrors: string = "";
      for (error of errorResponse.error.errors) {
        if (error.ID === PegaErrors.VALIDATION_ERROR) {
          this.handleValidationErrors(error.ValidationMessages);
        }
        else {
          sErrors += error.ID + " - " + error.message + "\n";
        }

      }

      if (sErrors != "") {
        let snackBarRef = this.snackBar.open(sErrors, "Ok");
      }
    }
    else {
      let generalSnackBarRef = this.snackBar.open(errorResponse.message, "Ok");
    }
    
  }




  // handle validation erorrs of type VALIDATION_ERROR
  handleValidationErrors(validationMessages: Array<any> ) {
    let message: any;
    for (message of validationMessages) {
      let ref = message.Path;
      if (ref) {
        if (ref.indexOf(".") == 0) {
          ref = ref.substring(1);
        }
        
        let controlName = this.refHelper.getControlNameFromReference(ref);
        
        // for each control, push the validation message and an error
        if (this.tvComp.fg.controls[controlName]) {
          this.tvComp.fg.controls[controlName].setErrors(message.ValidationMessage, {});
        }
      }
      else {
        // global message
        let snackBarRef = this.snackBar.open(message.ValidationMessage, "Ok");
      }
    }
  }
}
