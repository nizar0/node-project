import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = 'http://localhost:3001/bookings';
  constructor(private http: HttpClient) { }

  checkAvailability(id: string, startDate: string, endDate: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/check/availability`, { startDate, endDate });
  }


  bookYacht(id: string, bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/book`, bookingData);
  }

  getBookingsForOwner(): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner/bookings`);
  }
  getBookingsForClient(): Observable<any> {
    return this.http.get(`${this.apiUrl}/client`);
  }

  getBookingsById(id : string): Observable<any> {
    console.log('hetete',id)
    return this.http.get(`${this.apiUrl}/client/byId/${id}`);
  }

  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${bookingId}/status`, { status });
  }

}
