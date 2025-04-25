import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../interfaces/message';
import { catchError, Observable, throwError } from 'rxjs';
import { API_BASE } from '../utils/vars';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpClient) { }

  getMessages(chatId: string): Observable<Message[]> {
    return this.http
      .get<Message[]>(`${API_BASE}/chats/${chatId}/messages/`)
      .pipe(catchError(this.handleError));
  }

  sendMessage(chatId: string, content: string): Observable<Message> {
    return this.http
      .post<Message>(`${API_BASE}/chats/${chatId}/messages/`, { content })
      .pipe(catchError(this.handleError));
  }

  deleteMessage(chatId: string, messageId: number): Observable<void> {
    return this.http
      .delete<void>(`${API_BASE}/chats/${chatId}/messages/${messageId}/`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('MessageService Error:', error);
    return throwError(error.error || 'Server error');
  }
}
