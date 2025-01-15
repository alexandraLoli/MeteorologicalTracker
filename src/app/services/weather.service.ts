import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

    export interface Location {
      name: String;
      lat: number;
      lon: number;
    }

    export interface Current {
      temp_c: number;
      condition: Condition;
      wind_kph: number,
      wind_dir: String,
      humidity: number
    }

    export interface Condition {
      text: String;
      icon: String;
    }
    
    export interface Query {
      location: Location;
      current: Current
    }
  
    export interface Bulk {
      query: Query;
    }
    
    export interface WeatherResponse {
      bulk: Bulk[];
    }

@Injectable({
    providedIn: 'root'
})
export class WeatherService {
    private baseUrl = 'http://api.weatherapi.com/v1/current.json'; // Base URL of the API
    private apiKey = 'b878cc50ca0a47c3983113822251501'; // Your API key

    constructor(private http: HttpClient) { }

    getCitiesWeather(locations: string[]): Observable<WeatherResponse> {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
    
        // Correcting the URL to include `q=bulk`
        const url = `${this.baseUrl}?key=${this.apiKey}&q=bulk`;
    
        // Setting up the request body as per the bulk request requirements
        const body = {
          locations: locations.map(city => ({ q: city }))
        };
    
        return this.http.post<WeatherResponse>(url, body, { headers });
      }

}