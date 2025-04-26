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

    <ng-container *ngIf="!loading && profile">
      <!-- Own profile view/edit toggle -->
      <div class="profile-card">
        <div *ngIf="isOwnProfile && !editing">
          <h2>{{ profile.fullName }}</h2>
          <p class="username">{{ profile.username }}</p>
          <button (click)="startEdit()" class="btn-edit">Edit Profile</button>
        </div>

        <!-- Read-only view for others or own when not editing -->
        <div *ngIf="!editing">
          <div class="header">
            <img class="avatar" [src]="profile.profilePicture || 'assets/default-avatar.png'" alt="Profile Picture" />
          </div>
          <div class="details">
            <p><strong>Full Name:</strong> {{ profile.fullName }}</p>
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

        <!-- Editable form for own profile -->
        <form *ngIf="editing" [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
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
          <div class="buttons">
            <button type="button" (click)="cancelEdit()" class="btn-cancel">Cancel</button>
            <button type="submit" [disabled]="profileForm.invalid || submitting" class="btn-save">Save Changes</button>
          </div>
          <div *ngIf="success" class="success">Profile updated successfully.</div>
        </form>
      </div>
    </ng-container>
  `,
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profile!: Profile;
  loading = true;
  error: string | null = null;
  submitting = false;
  success = false;
  isOwnProfile = false;
  editing = false;

  formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'university', label: 'University', type: 'text' },
    { name: 'major', label: 'Major', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'] },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'preferredGender', label: 'Preferred Gender', type: 'select', options: ['male', 'female'] },
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
  ) { }

  ngOnInit(): void {
    this.profileService.getCurrentUser().subscribe({
      next: me => {
        this.currentUserId = me.id;
        this.loadViewedProfile();
      },
      error: () => this.loadViewedProfile()
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
        this.error = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  startEdit() {
    this.editing = true;
    this.success = false;
  }

  cancelEdit() {
    this.editing = false;
    this.profileForm.reset({ ...this.profile });
  }

  private initForm(data: Profile) {
    this.profileForm = this.fb.group({
      fullName: [data.fullName, Validators.required],
      university: [data.university, Validators.required],
      major: [data.major, Validators.required],
      location: [data.location, Validators.required],
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
    const raw = this.profileForm.value;
    const payload: Partial<Profile> = { ...raw };
    this.profileService.updateProfile(this.profile.id, payload).subscribe({
      next: updated => {
        this.profile = updated;
        this.submitting = false;
        this.success = true;
        this.editing = false;
      },
      error: () => {
        this.error = 'Update failed.';
        this.submitting = false;
      }
    });
  }
}
