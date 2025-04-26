import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  template: `
    <nav class="header-nav">
      <a routerLink="/" class="nav-link">Home</a>
      <a routerLink="/profiles" class="nav-link">Find</a>
      <a routerLink="/chats" class="nav-link" *ngIf="isLoggedIn">Chat</a>
      <a routerLink="/explore" class="nav-link" *ngIf="isLoggedIn">Explore</a>

      <div class="spacer"></div>

      <a routerLink="/register" class="nav-link" *ngIf="!isLoggedIn">Register</a>
      <a routerLink="/login" class="nav-link" *ngIf="!isLoggedIn">Login</a>
      <a *ngIf="isLoggedIn" [routerLink]="['/profiles', currentUserId]" class="nav-link">Profile</a>
      <button (click)="onLogout()" *ngIf="isLoggedIn" class="nav-link btn-logout">
        Logout
      </button>
    </nav>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUserId: string | null = null;
  private authSub!: Subscription;
  private profileSub!: Subscription;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authSub = this.authService.loggedIn$.subscribe(logged => {
      this.isLoggedIn = logged;
      if (logged) {
        this.profileSub = this.profileService.getCurrentUser().subscribe(
          profile => this.currentUserId = profile.id,
          () => this.currentUserId = null
        );
      } else {
        this.currentUserId = null;
        if (this.profileSub) this.profileSub.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.profileSub) this.profileSub.unsubscribe();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

