import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { endpoints } from './endpoints';


@Injectable({
  providedIn: 'root'
})
export class DatapageService {

  constructor(private http: HttpClient) { }


  dataPageUrl = endpoints.BASEURL + endpoints.DATA;

  pxResults: Object;

  getDataPage(id, dpParams) {

    var dataHeaders = new HttpHeaders();
    const encodedUser = localStorage.getItem("encodedUser");

    dataHeaders = dataHeaders.append('Authorization', 'Basic ' + encodedUser);
    dataHeaders = dataHeaders.append('Content-Type', "application/json");

    return this.http.get(this.dataPageUrl + "/" + id,
      { observe: 'response', params: dpParams, headers: dataHeaders});   
  }

  getResults(response) {
    return response.pxResults;
  }
}
