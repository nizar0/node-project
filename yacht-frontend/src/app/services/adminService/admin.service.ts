import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3001/admin';

  constructor(private http: HttpClient) {}


  approveUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/approve/${userId}`, {});
  }

  blockUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/block/${userId}`, {});
  }

  approveYacht(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/yachts/approve/fromAdmin/${id}`, {});
  }

  getAllYachts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/yachts/all/toAdmin`);
  }


  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getPendingReviews() {
    return this.http.get<any[]>(`${this.apiUrl}/reviews`);
  }

  approveReview(reviewId: string) {
    return this.http.put(`${this.apiUrl}/reviews/to/admin/approve/${reviewId}`, {});
  }

  deleteReview(reviewId: string) {
    return this.http.delete(`${this.apiUrl}/reviews/delete/${reviewId}`);
  }
}
