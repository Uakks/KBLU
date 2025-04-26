import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '../interfaces/preferences';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Profile } from '../interfaces/profile';
import { API_BASE } from '../utils/vars';
import { toSnakeCase } from '../utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  constructor(private http: HttpClient) { }

  updatePreferences(profileId: string, prefs: Preferences): Observable<Profile> {
    const paylaod = toSnakeCase(prefs);
    return this.http
      .put<any>(`${API_BASE}/preferences/${profileId}/`, paylaod)
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
    console.error('PreferencesService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
