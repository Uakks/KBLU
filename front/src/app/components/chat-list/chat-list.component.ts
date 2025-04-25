import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Chat } from '../../interfaces/chat';
import { Profile } from '../../interfaces/profile';
import { forkJoin, map } from 'rxjs';

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
    <div class="flex h-full">
      <aside class="w-1/4 border-r border-gray-200 bg-white flex flex-col">
        <header class="px-4 py-3 border-b border-gray-100">
          <div class="text-pink-500 font-bold text-lg">KBLU</div>
        </header>
        <ul class="flex-1 overflow-y-auto">
          <li *ngFor="let item of chatItems"
              class="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              (click)="goToChat(item.id)">
            <img
              [src]="item.other.profilePicture || 'assets/default-avatar.png'"
              alt=""
              class="w-10 h-10 rounded-full mr-3"
            />
            <div class="flex-1 overflow-hidden">
              <div class="font-medium text-gray-900 truncate">
                {{ item.other.username }}
              </div>
              <div class="text-sm text-gray-500 truncate">
                {{ item.lastSnippet }}
              </div>
            </div>
            <div class="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {{ item.lastTime }}
            </div>
          </li>
        </ul>
        <footer class="px-4 py-3 border-t border-gray-100">
          <button class="w-full py-2 bg-pink-500 text-white rounded-lg">
            New Chat
          </button>
        </footer>
      </aside>
      <section class="flex-1 bg-gray-50">
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
    // 1) Log in and store tokens
    // this.auth.login(this.logRequest).subscribe({
    //   next: tokens => {
    //     localStorage.setItem('access_token', tokens.access);
    //     localStorage.setItem('refresh_token', tokens.refresh);

    //     // 2) Load chats
    //     this.chatSvc.getChats().subscribe({
    //       next: chats => this.buildChatItems(chats),
    //       error: err => console.error('Failed to load chats:', err)
    //     });
    //   },
    //   error: err => console.error('Login failed:', err)
    // });
  }

  private buildChatItems(chats: Chat[]) {
    const currentUserId = this.extractUserIdFromToken();
    const observables = chats.map(chat => {
      // determine the “other” profile’s ID
      const otherId = chat.user1 === currentUserId ? chat.user2 : chat.user1;
      // fetch that profile
      return this.profSvc.getProfile(otherId).pipe(
        // map Profile → ChatListItem
        map(profile => ({
          id: chat.id,
          other: profile,
          lastSnippet: '...',      // placeholder, replace if you have last-msg data
          lastTime: this.formatTime(chat.created_at)
        }))
      );
    });

    // wait for all to complete
    forkJoin(observables).subscribe({
      next: items => (this.chatItems = items),
      error: err => console.error('Error building chat items:', err)
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
