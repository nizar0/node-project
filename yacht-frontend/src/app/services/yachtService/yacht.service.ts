import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class YachtService {
  private apiUrl = 'http://localhost:3001/yachts';
  constructor(private http: HttpClient) { }

// Créer un nouveau yacht
  createYacht(yachtData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, yachtData);
  }

  getMyYachts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Récupérer tous les yachts
  getAllYachts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Récupérer un yacht par son ID
  getYachtById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byId/${id}`);
  }
  getYachtByIdToClient(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byId/to/client/${id}`);
  }

  getPublicYachts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/client/all/public`);
  }

  // Mettre à jour un yacht par son ID
  updateYacht(id: string, yachtData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, yachtData);
  }

  // Supprimer un yacht par son ID
  deleteYacht(id: string): Observable<any> {
    console.log("id",id)
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  togglePublicStatus(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/public`, {});
  }

}
