// src/app/components/profiles/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../interfaces/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="loading" class="loading">Loading profile…</div>
    <div *ngIf="error" class="error">{{ error }}</div>

    <!-- Editable view for own profile -->
    <form *ngIf="!loading && isOwnProfile && profileForm" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-card">
      <h2>Edit Your Profile</h2>
      <ng-container *ngFor="let field of formFields">
        <div class="field">
          <label [for]="field.name">{{ field.label }}</label>
          <ng-container [ngSwitch]="field.type">
            <input *ngSwitchCase="'text'" [id]="field.name" [formControlName]="field.name" />
            <input *ngSwitchCase="'number'" [id]="field.name" type="number" [formControlName]="field.name" />
            <select *ngSwitchCase="'select'" [id]="field.name" [formControlName]="field.name">
              <option *ngFor="let opt of field.options" [value]="opt">{{ opt }}</option>
            </select>
          </ng-container>
        </div>
      </ng-container>
      <button type="submit" [disabled]="profileForm.invalid || submitting">Save Changes</button>
      <div *ngIf="success" class="success">Profile updated successfully.</div>
    </form>

    <!-- Read-only view for others -->
    <div *ngIf="!loading && profile && !isOwnProfile" class="profile-card">
      <div class="header">
        <img class="avatar" [src]="profile.profilePicture || 'assets/default-avatar.png'" alt="Profile Picture" />
        <h2>{{ profile.fullName }}</h2>
        <p class="username"> {{ profile.username }}</p>
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
        <p><strong>Gender:</strong> {{ profile.preferredGender | titlecase }}</p>
        <p><strong>Age Range:</strong> {{ profile.preferredAgeMin }} - {{ profile.preferredAgeMax }}</p>
        <p *ngIf="profile.preferredUniversity"><strong>University:</strong> {{ profile.preferredUniversity }}</p>
        <p *ngIf="profile.preferredMajor"><strong>Major:</strong> {{ profile.preferredMajor }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profile!: Profile;
  loading = true;
  error: string | null = null;
  submitting = false;
  success = false;
  isOwnProfile = false;

  // form metadata
  formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'university', label: 'University', type: 'text' },
    { name: 'major', label: 'Major', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['male','female'] },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'preferredGender', label: 'Preferred Gender', type: 'select', options: ['male','female'] },
    { name: 'preferredAgeMin', label: 'Preferred Age Min', type: 'number' },
    { name: 'preferredAgeMax', label: 'Preferred Age Max', type: 'number' },
    { name: 'preferredUniversity', label: 'Preferred University', type: 'text' },
    { name: 'preferredMajor', label: 'Preferred Major', type: 'text' }
  ];

  private currentUserId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // first fetch current user's profile to get their ID
    this.profileService.getProfile('me').subscribe({
      next: me => {
        this.currentUserId = me.id;
        this.loadViewedProfile();
      },
      error: err => {
        console.warn('Could not fetch current user', err);
        this.loadViewedProfile();
      }
    });
  }

  private loadViewedProfile() {
    const viewedId = this.route.snapshot.paramMap.get('id') || this.currentUserId;
    this.profileService.getProfile(viewedId).subscribe({
      next: prof => {
        this.profile = prof;
        this.isOwnProfile = prof.id === this.currentUserId;
        if (this.isOwnProfile) {
          this.initForm(prof);
        }
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  private initForm(data: Profile) {
    this.profileForm = this.fb.group({
      fullName: [data.fullName, Validators.required],
      username: [{ value: data.username, disabled: true }],
      university: [data.university],
      major: [data.major],
      location: [data.location],
      gender: [data.gender, Validators.required],
      age: [data.age, [Validators.required, Validators.min(12)]],
      preferredGender: [data.preferredGender],
      preferredAgeMin: [data.preferredAgeMin],
      preferredAgeMax: [data.preferredAgeMax],
      preferredUniversity: [data.preferredUniversity],
      preferredMajor: [data.preferredMajor],
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.submitting = true;
    const raw = this.profileForm.getRawValue();
    const updated: Profile = {
      ...this.profile,
      ...raw
    };
    this.profileService.updateProfile(this.profile.id, updated).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Update failed.';
        this.submitting = false;
      }
    });
  }
}
