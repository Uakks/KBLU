import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthTokens, LoginRequest, OAuthRequest, RefreshRequest, RefreshResponse } from '../interfaces/auth';
import { catchError, Observable, throwError } from 'rxjs';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(dto: LoginRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${API_BASE}/auth/login/`, dto)
      .pipe(catchError(this.handleError));
  }

  logout(refresh: string): Observable<void> {
    return this.http
      .post<void>(`${API_BASE}/auth/logout/`, { refresh })
      .pipe(catchError(this.handleError));
  }

  oauthLogin(dto: OAuthRequest): Observable<any> {
    return this.http
      .post<any>(`${API_BASE}/auth/oauth/`, dto)
      .pipe(catchError(this.handleError));
  }

  refreshToken(dto: RefreshRequest): Observable<RefreshResponse> {
    return this.http
      .post<RefreshResponse>(`${API_BASE}/auth/token/refresh/`, dto)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('AuthService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
