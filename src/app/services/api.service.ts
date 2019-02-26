import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
}
