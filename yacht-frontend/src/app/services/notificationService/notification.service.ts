import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:3001/notification';


  constructor(private http: HttpClient,private toastr: ToastrService) {}

  // Get all notifications for the logged-in user
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Mark a notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/all`, {});
  }



  showSuccess(message: string, title: string) {
    this.toastr.success(message, title);
  }

  showError(message: string, title: string) {
    this.toastr.error(message, title);
  }

  showInfo(message: string, title: string) {
    this.toastr.info(message, title);
  }

  showWarning(message: string, title: string) {
    this.toastr.warning(message, title);
  }
}
