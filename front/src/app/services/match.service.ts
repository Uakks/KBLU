import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '../interfaces/profile';
import { catchError, map, Observable, throwError } from 'rxjs';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor(private http: HttpClient) { }

  getMatches(): Observable<Profile[]> {
    return this.http
      .get<any[]>(`${API_BASE}/matches/`)
      .pipe(
        map(rawList =>
          rawList.map(raw => ({
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
          }))
        ),
        catchError(err => {
          console.error('ProfileService.getMatches Error', err);
          return throwError(err);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('MatchService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
