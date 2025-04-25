
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AuthTokens,
  LoginRequest,
  RefreshResponse
} from '../interfaces/auth';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  switchMap,
  throwError
} from 'rxjs';
import { API_BASE } from '../utils/vars';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public loggedIn$ = new BehaviorSubject<boolean>(!!this.getAccessToken());

  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) { }

  login(dto: LoginRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${API_BASE}/auth/login/`, dto).pipe(
      switchMap(tokens => {
        this.storeTokens(tokens);

        this.loggedIn$.next(true);

        return of(tokens);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return console.warn('No refresh token to send');
    }
  
    this.http
      .post(`${API_BASE}/auth/logout/`, { refresh }, {
        headers: { 'Content-Type': 'application/json' }
      })
      .subscribe({
        next: _ => {
          this.clearTokens();
          this.loggedIn$.next(false);
        },
        error: err => {
          console.error('Logout failed', err);
          this.clearTokens();
          this.loggedIn$.next(false);
        }
      });
  }  

  refreshToken(): Observable<RefreshResponse> {
    const refresh = this.getRefreshToken();
    if (!refresh) {

      this.loggedIn$.next(false);
      return throwError('No refresh token stored');
    }

    return this.http
      .post<RefreshResponse>(`${API_BASE}/auth/token/refresh/`, { refresh })
      .pipe(
        switchMap(resp => {
          this.storeTokens({
            access: resp.access,
            refresh: resp.refresh || refresh
          });
          this.refreshTokenSubject.next(resp.access);
          return of(resp);
        }),
        catchError(err => {
          this.clearTokens();
          this.loggedIn$.next(false);
          return throwError(err);
        })
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private handleError(error: HttpErrorResponse) {
    console.error('AuthService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
