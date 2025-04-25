import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Profile, ProfileCreateRequest } from '../interfaces/profile';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) { }

  getProfiles(filters?: Partial<Profile>): Observable<Profile[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const val = (filters as any)[key];
        if (val != null) {
          params = params.set(key, String(val));
        }
      });
    }
    return this.http
      .get<Profile[]>(`${API_BASE}/profiles/`, { params })
      .pipe(catchError(this.handleError));
  }

  createProfile(dto: ProfileCreateRequest): Observable<Profile> {
    return this.http
      .post<Profile>(`${API_BASE}/profiles/`, dto)
      .pipe(catchError(this.handleError));
  }

  getProfile(id: string): Observable<Profile> {
    return this.http
      .get<Profile>(`${API_BASE}/profiles/${id}/`)
      .pipe(catchError(this.handleError));
  }

  updateProfile(id: string, dto: Partial<ProfileCreateRequest>): Observable<Profile> {
    return this.http
      .patch<Profile>(`${API_BASE}/profiles/${id}/`, dto)
      .pipe(catchError(this.handleError));
  }

  deleteProfile(id: string): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE}/profiles/${id}/`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ProfileService Error:', error);
    return throwError(error.error || 'Server error');
  }
  getCurrentUser() {
    return this.http
      .get<Profile>(`${API_BASE}/me`)
      .pipe(catchError(this.handleError));
  }
}
