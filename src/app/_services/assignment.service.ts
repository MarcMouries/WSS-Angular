import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpClientModule, HttpResponse} from '@angular/common/http';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { endpoints } from './endpoints';
import { ReferenceHelper } from '../_helpers/reference-helper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root',
})
export class AssignmentService {

  refHelper: ReferenceHelper = new ReferenceHelper();

  constructor(private http: HttpClient) { }


  assignmentUrl = endpoints.BASEURL + endpoints.ASSIGNMENTS;


  pxResults: Object;


  getAssignment(id) {

    var assignmentParams = new HttpParams();
    var assignmentHeaders = new HttpHeaders();
    const encodedUser = localStorage.getItem("encodedUser");

    assignmentHeaders = assignmentHeaders.append('Authorization', 'Basic ' + encodedUser);
    assignmentHeaders = assignmentHeaders.append('Content-Type', "application/json");


    return this.http.get(this.assignmentUrl + "/" + id,
      { observe: 'response', params: assignmentParams, headers: assignmentHeaders});
  }
  

  getFieldsForAssignment(id, action): Observable<HttpResponse<any>> {


    var assignmentParams = new HttpParams();
    var assignmentHeaders = new HttpHeaders();
    const encodedUser = localStorage.getItem("encodedUser");

    assignmentHeaders = assignmentHeaders.append('Authorization', 'Basic ' + encodedUser);
    assignmentHeaders = assignmentHeaders.append('Content-Type', "application/json");

    return this.http.get(this.assignmentUrl + "/" + id + endpoints.ACTIONS +  "/" + action, 
      { observe: 'response', params: assignmentParams, headers: assignmentHeaders});
    

  }


  performRefreshOnAssignment(id, action, refreshFor, body) {

    var assignmentParams = new HttpParams();
    if (refreshFor && refreshFor != "") {
      assignmentParams = assignmentParams.append('refreshFor', refreshFor);
    }

    var assignmentHeaders = new HttpHeaders();
    const encodedUser = localStorage.getItem("encodedUser");

    assignmentHeaders = assignmentHeaders.append('Authorization', 'Basic ' + encodedUser);
    assignmentHeaders = assignmentHeaders.append('Content-Type', "application/json");
    
    let encodedId = encodeURI(id);
    let oContent = this.refHelper.getPostContent(body);

    return this.http.put(this.assignmentUrl + "/" + encodedId + endpoints.ACTIONS + "/" + action + endpoints.REFRESH, 
      { 'content' : oContent },
      { observe: 'response', params: assignmentParams, headers: assignmentHeaders});    
  
  }
  

  performActionOnAssignment(id, action, body) {

    var assignmentParams = new HttpParams();
    assignmentParams = assignmentParams.append('actionID', action);
    const encodedUser = localStorage.getItem("encodedUser");

    var assignmentHeaders = new HttpHeaders();
    assignmentHeaders = assignmentHeaders.append('Authorization', 'Basic ' + encodedUser);
    assignmentHeaders = assignmentHeaders.append('Content-Type', "application/json");
    
    let encodedId = encodeURI(id);
    let oContent = this.refHelper.getPostContent(body);

  
    return this.http.post(this.assignmentUrl + "/" + encodedId, { 'content' : oContent },
      { observe: 'response', params: assignmentParams, headers: assignmentHeaders});
  }

  assignments() {

    var assignmentParams = new HttpParams();
    var assignmentHeaders = new HttpHeaders();
    const encodedUser = localStorage.getItem("encodedUser");

    assignmentHeaders = assignmentHeaders.append('Authorization', 'Basic ' + encodedUser);
    assignmentHeaders = assignmentHeaders.append('Content-Type', "application/json");

    return this.http.get(this.assignmentUrl,
      { observe: 'response', params: assignmentParams, headers: assignmentHeaders});
  }


  

}


