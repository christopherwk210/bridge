import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = 'https://chorus.fightthe.pw/api';

  constructor(private http: HttpClient) { }

  getLatest(from?: number): Promise<any> {
    return new Promise(resolve => {
      let result;
      this.http.get(`${this.url}/latest?from=${from || 0}`).subscribe(
        success => result = success,
        err => result = err,
        () => {
          resolve(result);
        }
      );
    });
  }

  getRandom(from?: number): Promise<any> {
    return new Promise(resolve => {
      let result;
      this.http.get(`${this.url}/random?from=${from || 0}`).subscribe(
        success => result = success,
        err => result = err,
        () => {
          resolve(result);
        }
      );
    });
  }

  getBasicSearch(query: string, from?: number): Promise<any> {
    return new Promise(resolve => {
      let result;

      let params = new HttpParams();
      params = params.append('query', query);
      params = params.append('from', `${from || 0}`);

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
