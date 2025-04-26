import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:3001/reviews'; // Update this URL according to your backend

  constructor(private http: HttpClient) {}


  submitReview(reviewData: { yacht: string, rating: number, comment: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, reviewData);
  }


  getYachtReviews(yachtId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/yacht/${yachtId}`);
  }


  getHasReview(id:  string): Observable<any> {
    return this.http.get(`${this.baseUrl}/has-reviewed/${id}`);
  }

  getPendingReviews(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending`);
  }


  approveReview(reviewId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/approve/${reviewId}`, {});
  }


  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${reviewId}`);
  }
}
