// src/app/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProfileCreateRequest } from '../../../interfaces/profile';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-wrapper">
      <h1>Sign Up</h1>
      <div class="progress-bar">
        <div class="progress" [style.width]="(currentStep-1)/(steps.length-1)*100 + '%'">
        </div>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <!-- Step 1: Account Details -->
        <ng-container *ngIf="currentStep === 1" class="step step-1">
          <h2>Account Details</h2>
          <label>Username<input formControlName="username" /></label>
          <label>Password<input type="password" formControlName="password" /></label>
          <label>Confirm Password
            <input type="password" formControlName="confirmPassword" (keyup)="checkPasswordMatch()" />
          </label>
          <div *ngIf="passwordMismatch" class="error">Passwords do not match</div>
        </ng-container>

        <!-- Step 2: Personal Info -->
        <ng-container *ngIf="currentStep === 2" class="step step-2">
          <h2>Personal Info</h2>
          <label>Email<input formControlName="email" /></label>
          <label>Full Name<input formControlName="fullName" /></label>
          <label>Age<input type="number" formControlName="age" /></label>
          <label>Gender<select formControlName="gender">
              <option *ngFor="let g of genderOptions" [value]="g">{{ g }}</option>
            </select>
          </label>
          <label>Location<input formControlName="location" /></label>
          <label>Profile Picture URL<input formControlName="profilePicture" /></label>
        </ng-container>

        <!-- Step 3: Preferences -->
        <ng-container *ngIf="currentStep === 3" class="step step-3">
          <h2>Preferences</h2>
          <label>University<input formControlName="university" /></label>
          <label>Major<input formControlName="major" /></label>
          <label>Preferred Gender<select formControlName="preferredGender">
              <option *ngFor="let g of genderOptions" [value]="g">{{ g }}</option>
            </select>
          </label>
          <label>Preferred Age Range
            <input type="number" formControlName="preferredAgeMin" /> -
            <input type="number" formControlName="preferredAgeMax" />
          </label>
        </ng-container>

        <div class="buttons">
          <button type="button" (click)="prev()" *ngIf="currentStep > 1">Back</button>
          <button type="button" (click)="next()" *ngIf="currentStep < steps.length" [disabled]="!isCurrentValid()">Next</button>
          <button type="submit" *ngIf="currentStep === steps.length" [disabled]="registerForm.invalid">Register</button>
        </div>
      </form>

      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
  `,
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  passwordMismatch = false;

  genderOptions = ['male', 'female'];
  steps = ['account', 'personal', 'preferences'];
  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      age: [18, [Validators.required, Validators.min(12)]],
      gender: ['', Validators.required],
      location: ['', Validators.required],
      profilePicture: [''],
      university: ['', Validators.required],
      major: ['', Validators.required],
      preferredGender: ['', Validators.required],
      preferredAgeMin: [18, [Validators.required, Validators.min(0)]],
      preferredAgeMax: [99, [Validators.required]]
    });
  }

  checkPasswordMatch(): void {
    const pass = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    this.passwordMismatch = pass !== confirm;
    if (this.passwordMismatch) {
      this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.registerForm.get('confirmPassword')?.setErrors(null);
    }
  }

  next(): void {
    if (this.isCurrentValid()) {
      this.currentStep++;
    }
  }

  prev(): void {
    this.currentStep--;
  }

  isCurrentValid(): boolean {
    const groups = [
      ['username', 'password', 'confirmPassword'],
      ['email', 'fullName', 'age', 'gender', 'location'],
      ['university', 'major', 'preferredGender', 'preferredAgeMin', 'preferredAgeMax']
    ];
    const controls = groups[this.currentStep - 1];
    return controls.every(key => {
      const control = this.registerForm.get(key);
      return control && control.valid;
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch) return;

    const v = this.registerForm.value;
    const dto: ProfileCreateRequest = {
      username: v.username,
      password: v.password,
      email: v.email,
      fullName: v.fullName,
      university: v.university,
      major: v.major,
      location: v.location,
      gender: v.gender,
      age: v.age,
      profilePicture: v.profilePicture || undefined,
      preferredGender: v.preferredGender,
      preferredAgeMin: v.preferredAgeMin,
      preferredAgeMax: v.preferredAgeMax,
      preferredUniversity: '',
      preferredMajor: ''
    };
    
    console.log('Registering user:', dto);

    this.profileService.createProfile(dto).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => this.errorMessage = err.detail || 'Registration failed'
    });
  }
}

