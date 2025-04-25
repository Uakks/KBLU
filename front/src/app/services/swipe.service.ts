import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Swipe, SwipeCreate } from '../interfaces/swipe';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  constructor(private http: HttpClient) { }

  createSwipe(dto: SwipeCreate): Observable<Swipe> {
    return this.http
      .post<Swipe>(`${API_BASE}/swipes/`, dto)
      .pipe(catchError(this.handleError));
  }

  updateSwipe(dto: SwipeCreate): Observable<Swipe> {
    return this.http
      .patch<Swipe>(`${API_BASE}/swipes/`, dto)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('SwipeService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
