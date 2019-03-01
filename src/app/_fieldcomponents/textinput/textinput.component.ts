import { Component, OnInit, Input } from '@angular/core';
import { GetChangesService } from '../../_messages/getchanges.service';
import { FormControl, Validators, FormGroup } from '../../../../node_modules/@angular/forms';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { ReferenceHelper } from '../../_helpers/reference-helper';

@Component({
  selector: 'app-textinput',
  templateUrl: './textinput.component.html',
  styleUrls: ['./textinput.component.scss']
})
export class TextinputComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup: FormGroup;
  @Input() noLabel: boolean;
  @Input() CaseID: string;

  reference: string;
  selectedValue: string;
  localControlName$ : string;
  showLabel$: boolean = false;

  fieldControl = new FormControl('', null);
  actionsHandler: HandleActions;


  constructor(private gcservice: GetChangesService,
              private gaservice: GetActionsService,
              private refHelper: ReferenceHelper) { 

    this.actionsHandler = new HandleActions(gaservice);

  }

  ngOnInit() {
    this.selectedValue = this.fieldComp.value;
    this.reference = this.fieldComp.reference;

    // create controlName so can be refrenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getControlNameFromReference(this.fieldComp.reference);

    if (this.fieldComp.required) {
      //this.fieldControl.setValidators([Validators.required]);
    }

    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    }
    else {
      if (this.fieldComp.label != "") {
        this.showLabel$ = true;
      }
      else if (this.fieldComp.label == "" && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }

    if (this.fieldComp.disabled) {
      this.fieldControl.disable();
    }

    // add a controlName so can use it when referencing the control
    this.formGroup.addControl(this.fieldComp.controlName, this.fieldControl);
    this.fieldControl.setValue(this.fieldComp.value);

    if (this.fieldComp.validationMessages != "") {
      var timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({'message': true});
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
        });
    
    }
    
  }

  ngOnDestroy() {
    this.formGroup.removeControl(this.fieldComp.controlName);

    this.actionsHandler = null;
    delete this.actionsHandler;
  }



  fieldChanged(e) {
    this.gcservice.sendMessage(this.reference, e.target.value, this.CaseID);

    this.actionsHandler.generateActions("change", this.fieldComp.control.actionSets, this.CaseID);
  }

  fieldBlur(e) {
    this.actionsHandler.generateActions("blur", this.fieldComp.control.actionSets, this.CaseID);
  }

  fieldClick(e) {
    this.actionsHandler.generateActions("click", this.fieldComp.control.actionSets, this.CaseID);
  }


  referenceToName(sRef: string): string {
    let returnString = sRef.replace(/\./gi, "-");

    return returnString;
  }





  getErrorMessage() {
    let errMessage : string = "";


    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.fieldComp.validationMessages;
    }
    else if (this.fieldControl.hasError('required')) {

      errMessage = 'You must enter a value';
    }
    else if (this.fieldControl.errors) {

      errMessage = this.fieldControl.errors.toString();

    }
   

    return errMessage;
  }

 

}
