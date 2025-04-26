import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Profile, ProfileCreateRequest } from '../interfaces/profile';
import { API_BASE } from '../utils/vars';
import { toSnakeCase } from '../utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) { }

  getProfiles(filters?: Partial<Profile>): Observable<Profile[]> {
    let params = new HttpParams();
    if (filters) {
      const snakeFilters = toSnakeCase(filters as any);
      Object.entries(snakeFilters).forEach(([key, val]) => {
        if (val != null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }
    return this.http
      .get<any[]>(`${API_BASE}/profiles/`, { params })
      .pipe(
        map(rawList => rawList.map(raw => ({
          id: raw.id,
          user: raw.user,
          username: raw.username,
          fullName: raw.full_name,
          university: raw.university,
          major: raw.major,
          location: raw.location,
          gender: raw.gender,
          age: raw.age,
          profilePicture: raw.profile_picture ?? undefined,
          preferredGender: raw.preferred_gender,
          preferredAgeMin: raw.preferred_age_min,
          preferredAgeMax: raw.preferred_age_max,
          preferredUniversity: raw.preferred_university ?? undefined,
          preferredMajor: raw.preferred_major ?? undefined,
        }))),
        catchError(this.handleError)
      );
  }

  createProfile(dto: ProfileCreateRequest): Observable<Profile> {
    const payload = toSnakeCase(dto);
    return this.http
      .post<any>(`${API_BASE}/profiles/`, payload)
      .pipe(
        map(raw => ({
          id: raw.id,
          user: raw.user,
          username: raw.username,
          fullName: raw.full_name,
          university: raw.university,
          major: raw.major,
          location: raw.location,
          gender: raw.gender,
          age: raw.age,
          profilePicture: raw.profile_picture ?? undefined,
          preferredGender: raw.preferred_gender,
          preferredAgeMin: raw.preferred_age_min,
          preferredAgeMax: raw.preferred_age_max,
          preferredUniversity: raw.preferred_university ?? undefined,
          preferredMajor: raw.preferred_major ?? undefined,
        })),
        catchError(this.handleError)
      );
  }

  getProfile(id: string): Observable<Profile> {
    return this.http
      .get<any>(`${API_BASE}/profiles/${id}/`)
      .pipe(
        map(raw => ({
          id: raw.id,
          user: raw.user,
          username: raw.username,
          fullName: raw.full_name,
          university: raw.university,
          major: raw.major,
          location: raw.location,
          gender: raw.gender,
          age: raw.age,
          profilePicture: raw.profile_picture ?? undefined,
          preferredGender: raw.preferred_gender,
          preferredAgeMin: raw.preferred_age_min,
          preferredAgeMax: raw.preferred_age_max,
          preferredUniversity: raw.preferred_university ?? undefined,
          preferredMajor: raw.preferred_major ?? undefined,
        })),
        catchError(this.handleError)
      );
  }

  updateProfile(id: string, dto: Partial<ProfileCreateRequest>): Observable<Profile> {
    const payload = toSnakeCase(dto);
    return this.http
      .patch<any>(`${API_BASE}/profiles/${id}/`, payload)
      .pipe(
        map(raw => ({
          id: raw.id,
          user: raw.user,
          username: raw.username,
          fullName: raw.full_name,
          university: raw.university,
          major: raw.major,
          location: raw.location,
          gender: raw.gender,
          age: raw.age,
          profilePicture: raw.profile_picture ?? undefined,
          preferredGender: raw.preferred_gender,
          preferredAgeMin: raw.preferred_age_min,
          preferredAgeMax: raw.preferred_age_max,
          preferredUniversity: raw.preferred_university ?? undefined,
          preferredMajor: raw.preferred_major ?? undefined,
        })),
        catchError(this.handleError)
      );
  }

  deleteProfile(id: string): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE}/profiles/${id}/`)
      .pipe(catchError(this.handleError));
  }

  getCurrentUser(): Observable<Profile> {
    return this.http
      .get<any>(`${API_BASE}/profiles/me/`)
      .pipe(
        map(raw => ({
          id: raw.id,
          user: raw.user,
          username: raw.username,
          fullName: raw.full_name,
          university: raw.university,
          major: raw.major,
          location: raw.location,
          gender: raw.gender,
          age: raw.age,
          profilePicture: raw.profile_picture ?? undefined,
          preferredGender: raw.preferred_gender,
          preferredAgeMin: raw.preferred_age_min,
          preferredAgeMax: raw.preferred_age_max,
          preferredUniversity: raw.preferred_university ?? undefined,
          preferredMajor: raw.preferred_major ?? undefined,
        })),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ProfileService Error:', error);
    return throwError(error.error || 'Server error');
  }
}