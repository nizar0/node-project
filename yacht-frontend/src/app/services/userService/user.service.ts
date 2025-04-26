import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../constants/User';
import {Role} from '../../constants/Role.enum';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3001/users';

  constructor(private http: HttpClient) {}

  createUser(user: FormData): Observable<any> {
    console.log('Creating user:', user);
    return this.http.post<any>(this.apiUrl, user);
  }

  loginUser(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.put<{ user: User,token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  // Récupérer les informations d'un utilisateur par ID
  getUserById(id: string): Observable<User> {
    console.log('Fetching user by ID:', id);
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser( updatedUser: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/user/update`, updatedUser);
  }

  // Supprimer un utilisateur
  deleteUser(id: string): Observable<void> {
    console.log('Deleting user:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
