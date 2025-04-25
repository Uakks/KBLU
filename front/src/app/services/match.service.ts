import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '../interfaces/profile';
import { catchError, Observable, throwError } from 'rxjs';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor(private http: HttpClient) {}

  getMatches(): Observable<Profile[]> {
    return this.http
      .get<Profile[]>(`${API_BASE}/matches/`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('MatchService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
