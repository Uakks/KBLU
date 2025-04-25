import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="header-nav">
      <a routerLink="/" class="nav-link">Home</a>
      <a routerLink="/profiles" class="nav-link">Profiles</a>
      <a routerLink="/chats" class="nav-link" *ngIf="isLoggedIn">Chats</a>
      <a routerLink="/matches" class="nav-link" *ngIf="isLoggedIn">Matches</a>

      <div class="spacer"></div>

      <a routerLink="/register" class="nav-link" *ngIf="!isLoggedIn">Register</a>
      <a routerLink="/login" class="nav-link" *ngIf="!isLoggedIn">Login</a>
      <button (click)="onLogout()" *ngIf="isLoggedIn" class="nav-link btn-logout">
        Logout
      </button>
    </nav>
  `,
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isLoggedIn = false;
  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.sub = this.authService.loggedIn$.subscribe(
      logged => this.isLoggedIn = logged
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
