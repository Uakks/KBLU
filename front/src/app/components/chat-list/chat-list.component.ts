import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Chat } from '../../interfaces/chat';
import { Profile } from '../../interfaces/profile';
import { forkJoin, map, switchMap } from 'rxjs';

interface ChatListItem {
  id: string;
  other: Profile;
  lastSnippet: string;
  lastTime: string;
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="chat-container">
      <aside class="chat-sidebar">
        <header class="chat-header">
          <div class="app-name">KBLU</div>
        </header>
        <ul class="chat-list">
          <li *ngFor="let item of chatItems"
              class="chat-item"
              (click)="goToChat(item.id)">
            <img
              [src]="item.other.profilePicture || 'assets/default-avatar.png'"
              alt=""
              class="avatar"
            />
            <div class="chat-info">
              <div class="username">{{ item.other.username }}</div>
              <div class="snippet">{{ item.lastSnippet }}</div>
            </div>
            <div class="timestamp">{{ item.lastTime }}</div>
          </li>
        </ul>
        <footer class="chat-footer">
          <button class="new-chat-btn">New Chat</button>
        </footer>
      </aside>
      <section class="chat-content">
        <router-outlet></router-outlet>
      </section>
    </div>

  `,
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  chatItems: ChatListItem[] = [];
  // private logRequest = { username: 'lox', password: 'Aa220506' }; //used for testing purposes

  constructor(
    private auth: AuthService,
    private chatSvc: ChatService,
    private profSvc: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const accessToken = this.auth.getAccessToken();
    if (!accessToken) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.chatSvc.getChats().subscribe({
      next: chats => this.buildChatItems(chats),
      error: err => {
        console.error('Failed to load chats:', err);
        if (err.status === 401) {
          this.auth.clearTokens();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private buildChatItems(chats: Chat[]): void {
    this.profSvc.getCurrentUser().pipe(
      switchMap(currentUser => {
        const items$ = chats.map(chat => {
          // pick the other user’s ID
          const otherId = chat.user1 === currentUser.id ? chat.user2 : chat.user1;
  
          return this.profSvc.getProfile(otherId).pipe(
            map(profile => ({
              id:          chat.id,
              other:       profile,
              lastSnippet: '',                        // or e.g. `Matched on ${this.formatDate(chat.created_at)}`
              lastTime:    this.formatTime(chat.created_at)
            } as ChatListItem))
          );
        });
        return forkJoin(items$);
      })
    ).subscribe({
      next: items => this.chatItems = items,
      error:  err   => console.error('Error building chat items:', err)
    });
  }
  
  

  goToChat(chatId: string) {
    this.router.navigate(['/chats', chatId]);
  }

  private extractUserIdFromToken(): string {
    const token = localStorage.getItem('access_token') || '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.user_id || payload.user_id);
    } catch {
      return '';
    }
  }

  private formatTime(iso: string): string {
    const d = new Date(iso);
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = d.getHours() < 12 ? 'AM' : 'PM';
    return `${h}:${m} ${ampm}`;
  }
}
