// my-http-service.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TweetService {

  private baseUrl = 'http://localhost:3000'; // Replace with your API base URL

  constructor(private http: HttpClient) { }

  // Example method to fetch data from the API
  fetchTweet(id: string): Observable<any> {
    const url = `${this.baseUrl}/fetch-tweet/${id}`;
    return this.http.get(url);
  }
}
