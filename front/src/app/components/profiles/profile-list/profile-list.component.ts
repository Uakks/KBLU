import { Component, OnInit } from '@angular/core';
import { CommonModule }            from '@angular/common';
import { RouterModule }            from '@angular/router';
import { ProfileService }          from '../../../services/profile.service';
import { Profile }                 from '../../../interfaces/profile';
import { Observable }              from 'rxjs';


@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- src/app/profile/profile-list.component.html -->
    <ng-container *ngIf="!loading; else loadingTpl">
      <div *ngIf="error" class="error">{{ error }}</div>
      <div class="list-grid" *ngIf="!error">
        <a
          class="card"
          *ngFor="let p of profiles$ | async"
          [routerLink]="['/profiles', p.id]"
        >
          <img [src]="p.profilePicture || 'assets/default-avatar.png'" alt="{{ p.username }}"/>
          <h4>{{ p.fullName }}</h4>
          <p class="username">{{ p.username }}</p>
          <p class="sub">{{ p.university }}, {{ p.major }}</p>
        </a>
      </div>
    </ng-container>

    <ng-template #loadingTpl>
      <p>Loading profiles…</p>
    </ng-template>
  `,
  styleUrl: './profile-list.component.css',
})
export class ProfileListComponent implements OnInit {
  profiles$: Observable<Profile[]> | undefined;
  loading = true;
  error: string | null = null;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profiles$ = this.profileService.getProfiles();  // returns Observable<Profile[]>
    // mark loading false when data arrives or errors
    this.profiles$.subscribe({
      next: () => this.loading = false,
      error: err => {
        this.error = 'Could not load profiles';
        this.loading = false;
        console.error(err);
      }
    });
  }
}

