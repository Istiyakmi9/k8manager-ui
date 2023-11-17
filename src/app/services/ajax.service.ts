import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AjaxService {
  baseUrl: string = "";

  constructor(private http: HttpClient) {
    this.baseUrl = environment.baseUrl;
  }

  get(url: string) {
    return this.http.get(this.baseUrl + url);
  }

  post(url: string, value: any) {
    return this.http.post<any>(this.baseUrl + url, value);
  }
}
