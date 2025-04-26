import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:3001/weathers';

  getWeather(city:string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${city}`);
  }
}
