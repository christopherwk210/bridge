import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = 'https://chorus.fightthe.pw/api';

  constructor(private http: HttpClient) { }

  getLatest(): Promise<any> {
    return new Promise(resolve => {
      let result;
      this.http.get(`${this.url}/latest`).subscribe(
        success => result = success,
        err => result = err,
        () => {
          resolve(result);
        }
      );
    });
  }

  getRandom(): Promise<any> {
    return new Promise(resolve => {
      let result;
      this.http.get(`${this.url}/random`).subscribe(
        success => result = success,
        err => result = err,
        () => {
          resolve(result);
        }
      );
    });
  }

  getBasicSearch(query: string): Promise<any> {
    return new Promise(resolve => {
      let result;

      let params = new HttpParams();
      params = params.append('query', query);

      this.http.get(`${this.url}/search`, { params }).subscribe(
        success => result = success,
        err => result = err,
        () => {
          resolve(result);
        }
      );
    });
  }
}
