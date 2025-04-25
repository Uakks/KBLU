import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, map } from 'rxjs/operators';
import { MessageService } from '../../services/message.service';
import { ProfileService } from '../../services/profile.service';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../interfaces/message';
import { Profile } from '../../interfaces/profile';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <button class="back-btn" (click)="goBack()">‹</button>
      <img
        class="avatar"
        [src]="receivingUser.profilePicture || 'assets/avatar-other.jpg'"
        alt="{{ receivingUser.username }}’s avatar"
      />
      <div class="info">
        <div class="name">{{ receivingUser.username }}</div>
        <div class="status">Online</div>
      </div>
    </header>

    <!-- Date Divider -->
    <div class="date-divider">Today</div>

    <!-- Messages -->
    <div class="messages">
      <div
        *ngFor="let msg of messages"
        class="message-wrapper"
        [class.outgoing]="msg.sender === (currentUser.id + '')"
        [class.incoming]="msg.sender !== (currentUser.id + '')"
      >
        <!-- avatar on left for incoming -->
        <img
          *ngIf="msg.sender !== (currentUser.id + '')"
          class="msg-avatar"
          [src]="receivingUser.profilePicture || 'assets/avatar-other.jpg'"
          alt="Other user avatar"
        />

        <div class="bubble">
          {{ msg.content }}
          <div class="ts">{{ msg.timestamp | date:'shortTime' }}</div>
        </div>

        <!-- avatar on right for outgoing -->
        <img
          *ngIf="msg.sender === (currentUser.id + '')"
          class="msg-avatar me"
          src="assets/avatar-me.jpg"
          alt="My avatar"
        />
      </div>
    </div>

    <!-- Input -->
    <nav class="chat-input">
      <input
        type="text"
        placeholder="Message..."
        [(ngModel)]="newMessage"
        (keyup.enter)="send()"
      />
      <button class="send-btn" (click)="send()">➤</button>
    </nav>
  </div>
  `,
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit {
  chatId!: string;
  messages: Message[] = [];
  newMessage = '';
  currentUser!: Profile;
  receivingUser!: Profile;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private chatService: ChatService,
    private profileService: ProfileService,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.profileService
      .getCurrentUser()
      .pipe(
        switchMap(user => {
          this.currentUser = user;
          console.log('Current user from /api/me/', user);
          this.chatId = this.route.snapshot.paramMap.get('id')!;
          return this.messageService.getMessages(this.chatId);
        }),
        switchMap(msgs => {
          this.messages = msgs;
          return this.chatService.getChats().pipe(
            map(chats => chats.find(c => c.id === this.chatId)!)
          );
        }),
        switchMap(chat => {
          const otherId =
            chat.user1 === this.currentUser.id ? chat.user2 : chat.user1;
          return this.profileService.getProfile(otherId);
        })
      )
      .subscribe({
        next: prof => (this.receivingUser = prof),
        error: err => {
          console.error('Chat-detail init error', err);
        }
      });
  }
  

  send(): void {
    const content = this.newMessage.trim();
    if (!content) return;

    this.messageService.sendMessage(this.chatId, content).subscribe({
      next: msg => {
        this.messages.push(msg);
        this.newMessage = '';
      },
      error: err => console.error('Failed to send message', err)
    });
  }

  delete(msg: Message): void {
    this.messageService.deleteMessage(this.chatId, msg.id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== msg.id);
      },
      error: err => console.error('Failed to delete message', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/chats']);
  }
}
