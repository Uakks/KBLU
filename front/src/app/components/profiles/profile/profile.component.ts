// src/app/components/profiles/profile/profile.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { ActivatedRoute }         from '@angular/router';
import { ProfileService }         from '../../../services/profile.service';
import { Profile }                from '../../../interfaces/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-card" *ngIf="!loading && profile; else loadingTpl">
      <div class="header">
        <img
          class="avatar"
          [src]="profile.profilePicture || 'assets/default-avatar.png'"
          alt="Profile Picture"
        />
        <h2>{{ profile.fullName }}</h2>
        <p class="username">{{ profile.username }}</p>
      </div>

      <div class="details">
        <p><strong>University:</strong> {{ profile.university }}</p>
        <p><strong>Major:</strong> {{ profile.major }}</p>
        <p><strong>Location:</strong> {{ profile.location }}</p>
        <p><strong>Gender:</strong> {{ profile.gender | titlecase }}</p>
        <p><strong>Age:</strong> {{ profile.age }}</p>
      </div>

      <div class="preferences">
        <h3>Preferences</h3>
        <p>
          <strong>Gender:</strong> {{ profile.preferredGender | titlecase }}
        </p>
        <p>
          <strong>Age Range:</strong> {{ profile.preferredAgeMin }} -
          {{ profile.preferredAgeMax }}
        </p>
        <p *ngIf="profile.preferredUniversity">
          <strong>University:</strong> {{ profile.preferredUniversity }}
        </p>
        <p *ngIf="profile.preferredMajor">
          <strong>Major:</strong> {{ profile.preferredMajor }}
        </p>
      </div>
    </div>

    <ng-template #loadingTpl>
      <p *ngIf="loading">Loading profile...</p>
      <p *ngIf="error">{{ error }}</p>
    </ng-template>
  `,
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No profile ID provided';
      this.loading = false;
      return;
    }

    this.profileService.getProfile(id).subscribe({
      next: data => {
        this.profile = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Could not load profile.';
        this.loading = false;
      }
    });
  }
}
