import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '../interfaces/preferences';
import { catchError, Observable, throwError } from 'rxjs';
import { Profile } from '../interfaces/profile';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  constructor(private http: HttpClient) { }

  updatePreferences(profileId: string, prefs: Preferences): Observable<Profile> {
    return this.http
      .put<Profile>(`${API_BASE}/preferences/${profileId}/`, prefs)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('PreferencesService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
