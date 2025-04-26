import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3001/orders';

  constructor(private http: HttpClient) {}

  getPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user`);
  }
}
