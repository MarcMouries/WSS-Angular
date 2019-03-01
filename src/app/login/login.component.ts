import { Component, OnInit, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { UserService } from "../_services/user.service";
import { GetLoginStatusService } from "../_messages/getloginstatus.service";
import { DatapageService } from "../_services/datapage.service";
import { interval } from "rxjs/internal/observable/interval";
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginData: any = {};

  constructor(private uservice: UserService, 
              private glsservice: GetLoginStatusService,
              private dservice: DatapageService,
              private snackBar: MatSnackBar ) { }

  pxTextInputControl = new FormControl('', null);

  ngOnInit() {
  }


  doLogin() {
    // delay, so on change for password value can get in

    var timer = interval(100).subscribe(() => {
      this.attemptLogin();
      timer.unsubscribe();
      });

  }

  attemptLogin() {

    this.uservice.login(this.loginData.userName, this.loginData.password).subscribe(
      response => {
        if (response.status == 200) {
          let operatorParams = new HttpParams()

          this.dservice.getDataPage("D_OperatorID", operatorParams).subscribe(
            response => {

              let operator: any = response.body;
              localStorage.setItem("userFullName", operator.pyUserName);
              localStorage.setItem("userAccessGroup", operator.pyAccessGroup);
              localStorage.setItem("userWorkGroup", operator.pyWorkGroup);
              localStorage.setItem("userWorkBaskets", JSON.stringify(operator.pyWorkBasketList));

              this.glsservice.sendMessage("LoggedIn");
            },
            err => {
              let sError = "Errors getting data page: " + err.message;
              let snackBarRef = this.snackBar.open(sError, "Ok");
            }
          );



          
        }
      },
      err => {

        let snackBarRef = this.snackBar.open(err.message, "Ok");
        this.glsservice.sendMessage("LoggedOut");
        localStorage.clear();
      }
    );
    
  }

  fieldChanged(e) {
    this.loginData[e.target.id] = e.target.value;

  }


}
