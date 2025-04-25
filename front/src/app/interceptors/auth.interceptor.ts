import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, Provider } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { API_BASE, PUBLIC_ENDPOINTS } from "../utils/vars";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      PUBLIC_ENDPOINTS.some(ep => request.url.startsWith(ep)) ||
      (request.url === `${API_BASE}/profiles/` && (request.method === 'GET' || request.method === 'POST'))
    ) {
      return next.handle(request);
    }

    const accessToken = this.auth.getAccessToken();
    let cloned = request;

    if (accessToken) {
      cloned = request.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
      });
    }

    return next.handle(cloned).pipe(
      catchError(err => {
        if (err.status === 401) {
          return this.handle401(cloned, next);
        }
        return throwError(err);
      })
    );
  }

  private handle401(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.auth.isRefreshing) {
      this.auth.isRefreshing = true;
      this.auth.refreshTokenSubject.next(null);

      return this.auth.refreshToken().pipe(
        switchMap(tokenResp => {
          this.auth.isRefreshing = false;
          const newAccess = tokenResp.access;
          return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } }));
        }),
        catchError(err => {
          this.auth.clearTokens();
          return throwError(err);
        })
      );
    } else {
      return this.auth.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(access => next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${access}` } })))
      );
    }
  }
}
