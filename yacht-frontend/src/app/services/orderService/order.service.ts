import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:3001/orders';
  constructor(private http: HttpClient) { }


  saveOrder(orderData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-order`, orderData);
  }

  getPayments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`);
  }

  getOrderStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/order-statistics`);
  }

  ownerEarnings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/earnings`);
  }
}
