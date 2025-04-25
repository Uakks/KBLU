import { Injectable } from '@angular/core';
import { Chat } from '../interfaces/chat';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) { }

  getChats(): Observable<Chat[]> {
    return this.http
      .get<Chat[]>(`${API_BASE}/chats/`)
      .pipe(catchError(this.handleError));
  }

  createChat(user2: string): Observable<Chat> {
    return this.http
      .post<Chat>(`${API_BASE}/chats/`, { user2 })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ChatService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
