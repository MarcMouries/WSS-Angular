import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl, Validators} from '@angular/forms';
import { GetChangesService } from '../../_messages/getchanges.service';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { DatapageService } from '../../_services/datapage.service';
import {map, startWith} from 'rxjs/operators';
import { ReferenceHelper } from '../../_helpers/reference-helper';
import { GetCaseService } from '../../_messages/getcase.service';
import { Subscription, Observable, of } from 'rxjs';


export interface CompleteOptions {
  key: string;
  value: string;
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup: FormGroup;
  @Input() noLabel: boolean;
  @Input() CaseID: string;

  filteredOptions: Observable<CompleteOptions[]>;

  reference: string;
  selectedValue: string;
  options$: CompleteOptions[];
  valueReadonly$: string;

  showLabel$: boolean = false;

  fieldControl = new FormControl('', null);
  actionsHandler: HandleActions;

  getCaseMessage: any;
  getCaseSubscription: Subscription;

  constructor(private gchservice: GetChangesService,
              private gaservice: GetActionsService,
              private dpservice: DatapageService,
              private refHelper: ReferenceHelper,
              private gcservice: GetCaseService) { 

    this.actionsHandler = new HandleActions(gaservice);


  }

  ngOnInit() {
    this.selectedValue = this.fieldComp.value;
    this.reference = this.fieldComp.reference;

    // create controlName so can be refrenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getControlNameFromReference(this.fieldComp.reference);

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

    if (this.fieldComp.control.modes[0].listSource === "datapage") {
      // handle data page
      let dataPageName = this.fieldComp.control.modes[0].dataPageID || this.fieldComp.control.modes[0].dataPage;
      this.dpservice.getDataPage(dataPageName, null).subscribe(
        response => {
          try {
            let results: any = response.body["pxResults"];
            let entryValue = this.fieldComp.control.modes[0].dataPagePrompt;
            let entryKey = this.fieldComp.control.modes[0].dataPageValue;

            this.options$ = new Array<CompleteOptions>();
            for (let result of results) {
              let option = <CompleteOptions>{};
              option["key"] = result[entryKey];
              option["value"] = result[entryValue];
              this.options$.push(option);

            }
            
            this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);

            this.filteredOptions = this.fieldControl.valueChanges
            .pipe(
              startWith(''),
              map(value => value ? this._filterOptions(value) : this.options$.slice())
            );


          }
          catch (ex) {

          }
        },
        err => {

        }
      );

      this.fieldControl.setValue(this.fieldComp.value);


      
    }
    else if (this.fieldComp.control.modes[0].listSource === "pageList") {
      let clipboardPageName = this.fieldComp.control.modes[0].clipboardPageID;
      let entryValue = this.fieldComp.control.modes[0].clipboardPagePrompt;
      let entryKey = this.fieldComp.control.modes[0].clipboardPageValue;
      let entryTooltip = this.fieldComp.control.modes[0].clipboardPageTooltip;

      this.getCaseSubscription = this.gcservice.getMessage().subscribe(message => { 
        this.getCaseMessage = message;
        
        if (message) {
          let workPage = message.case.content;

          if (workPage) {
            let cPage = workPage[clipboardPageName];
            if (cPage) {

              this.options$ = new Array<CompleteOptions>();
              for (let result of cPage) {
                let option = <CompleteOptions>{};
                option["key"] = result[entryKey];
                option["value"] = result[entryValue];
                this.options$.push(option);
  
              }
              
              this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
  
              this.filteredOptions = this.fieldControl.valueChanges
              .pipe(
                startWith(''),
                map(value => value ? this._filterOptions(value) : this.options$.slice())
              );
            }
          }
        }


      });
      


      
    }
    else if (this.fieldComp.control.modes[0].listSource === "locallist") {
      this.options$ = this.fieldComp.control.modes[0].options;

      this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);


      this.filteredOptions = this.fieldControl.valueChanges
      .pipe(
        startWith(''),
        map(value => value ? this._filterOptions(value) : this.options$.slice())
      );

    }


    if (this.fieldComp.required) {
      this.fieldControl.setValidators([Validators.required]);
    }

    if (this.fieldComp.disabled) {
      this.fieldControl.disable();
    }

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

  getOptionValue(value: string): string {
    for (let obj of this.options$) {
      if (obj["key"] === value) {
        return obj["value"];
      }
    }

    return "";
}



  fieldChanged(e) {

    this.gchservice.sendMessage(this.reference, e.target.value, this.CaseID);

    this.actionsHandler.generateActions("change", this.fieldComp.control.actionSets, this.CaseID);
  }

  optionChanged(e) {

    this.gchservice.sendMessage(this.reference, e.option.value, this.CaseID);

    this.actionsHandler.generateActions("change", this.fieldComp.control.actionSets, this.CaseID);  
  }

  fieldBlur(e) {
    this.actionsHandler.generateActions("blur", this.fieldComp.control.actionSets, this.CaseID);
  }

  fieldClick(e) {
    this.actionsHandler.generateActions("click", this.fieldComp.control.actionSets, this.CaseID);
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

  private _filterOptions(value: string): CompleteOptions[] {

    const filterValue = value.toLowerCase();

    return this.options$.filter(option => option.key.toLowerCase().includes(filterValue));
  }
}
