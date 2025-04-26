// src/app/components/swipe/swipe.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Profile } from '../../interfaces/profile';
import { ProfileService } from '../../services/profile.service';
import { SwipeService } from '../../services/swipe.service';
import { SwipeCreate } from '../../interfaces/swipe';

@Component({
  selector: 'app-swipe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="swipe-wrapper">
      <div *ngIf="loading" class="loading">Loading students…</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <ng-container *ngIf="!loading && !error">
        <div *ngIf="noMore" class="no-more">No more students to show.</div>
        <div *ngIf="currentProfile && !noMore" class="swipe-card">
          <div class="image-container">
            <img [src]="currentProfile.profilePicture || 'assets/default-avatar.png'"
                 alt="{{ currentProfile.fullName }}" />
          </div>
          <div class="info">
            <h3>{{ currentProfile.fullName }}</h3>
            <p class="username">{{ currentProfile.username }}</p>
            <p>{{ currentProfile.university }} · {{ currentProfile.major }}</p>
            <p>{{ currentProfile.location }}</p>
          </div>
          <div class="buttons">
            <button class="btn-reject" (click)="swipe('reject')">Reject</button>
            <button class="btn-like" (click)="swipe('like')">Like</button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./swipe.component.css'],
})
export class SwipeComponent implements OnInit, OnDestroy {
  profiles: Profile[] = [];
  currentProfile: Profile | null = null;
  currentIndex = 0;
  noMore = false;
  loading = true;
  error: string | null = null;

  private currentUserId!: string;
  private subs: Subscription[] = [];

  constructor(
    private profileService: ProfileService,
    private swipeService: SwipeService
  ) { }

  ngOnInit(): void {
    const sub = this.profileService.getCurrentUser().subscribe({
      next: user => {
        this.currentUserId = user.id;
        this.loadProfiles();
      },
      error: err => {
        this.error = 'Failed to fetch current user.';
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  private loadProfiles(): void {
    const sub = this.profileService.getProfiles().subscribe({
      next: list => {
        this.profiles = list.filter(p => p.id !== this.currentUserId);
        this.loading = false;
        this.setCurrent();
      },
      error: err => {
        this.error = 'Failed to load students.';
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  private setCurrent(): void {
    if (this.currentIndex < this.profiles.length) {
      this.currentProfile = this.profiles[this.currentIndex];
    } else {
      this.noMore = true;
      this.currentProfile = null;
    }
  }

  swipe(decision: 'like' | 'reject'): void {
    if (!this.currentProfile) return;
    const dto: SwipeCreate = {
      from_profile: this.currentUserId,
      to_profile: this.currentProfile.id,
      decision
    };

    const sub = this.swipeService.createSwipe(dto).subscribe({
      next: () => {
        this.currentIndex++;
        this.setCurrent();
      },
      error: err => {
        console.error('Swipe error', err);
        this.currentIndex++;
        this.setCurrent();
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
