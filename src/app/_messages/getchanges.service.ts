import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetChangesService {

  private subject = new Subject<any>();
 
  sendMessage(sReference: string, sValue: string, sCaseID: string) {
      this.subject.next({ ref: sReference, value: sValue, caseID: sCaseID});
  }

  clearMessage() {
      this.subject.next();
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }

}
