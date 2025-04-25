import { Component } from '@angular/core';
import { ProfileCreateRequest } from '../../../interfaces/profile';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

      <label>
        Username:
        <input formControlName="username" />
      </label>

      <label>
        Password:
        <input type="password" formControlName="password" />
      </label>

      <label>
        Email:
        <input formControlName="email" />
      </label>

      <label>
        Full Name:
        <input formControlName="fullName" />
      </label>

      <label>
        University:
        <input formControlName="university" />
      </label>

      <label>
        Major:
        <input formControlName="major" />
      </label>

      <label>
        Location:
        <input formControlName="location" />
      </label>

      <label>
        Gender:
        <select formControlName="gender">
          <option *ngFor="let g of genderOptions" [value]="g">{{ g }}</option>
        </select>
      </label>

      <label>
        Age:
        <input type="number" formControlName="age" />
      </label>

      <label>
        Profile Picture URL:
        <input formControlName="profilePicture" />
      </label>

      <fieldset>
        <legend>Preferences</legend>

        <label>
          Preferred Gender:
          <select formControlName="preferredGender">
            <option *ngFor="let g of genderOptions" [value]="g">{{ g }}</option>
          </select>
        </label>

        <label>
          Preferred Age Min:
          <input type="number" formControlName="preferredAgeMin" />
        </label>

        <label>
          Preferred Age Max:
          <input type="number" formControlName="preferredAgeMax" />
        </label>

        <label>
          Preferred University:
          <input formControlName="preferredUniversity" />
        </label>

        <label>
          Preferred Major:
          <input formControlName="preferredMajor" />
        </label>
      </fieldset>

      <button type="submit" [disabled]="registerForm.invalid">Register</button>
    </form>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  errorMessage: string | null = null;

  genderOptions = ['male', 'female'];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      university: ['', Validators.required],
      major: ['', Validators.required],
      location: ['', Validators.required],
      gender: ['', Validators.required],
      age: [18, [Validators.required, Validators.min(12)]],
      profilePicture: [''],
      preferredGender: ['', Validators.required],
      preferredAgeMin: [18, [Validators.required, Validators.min(0)]],
      preferredAgeMax: [99, [Validators.required]],
      preferredUniversity: [''],
      preferredMajor: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    const dto: ProfileCreateRequest = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      email: this.registerForm.value.email,
      fullName: this.registerForm.value.fullName,
      university: this.registerForm.value.university,
      major: this.registerForm.value.major,
      location: this.registerForm.value.location,
      gender: this.registerForm.value.gender,
      age: this.registerForm.value.age,
      profilePicture: this.registerForm.value.profilePicture || undefined,
      preferredGender: this.registerForm.value.preferredGender,
      preferredAgeMin: this.registerForm.value.preferredAgeMin,
      preferredAgeMax: this.registerForm.value.preferredAgeMax,
      preferredUniversity: this.registerForm.value.preferredUniversity || undefined,
      preferredMajor: this.registerForm.value.preferredMajor || undefined,
    };

    this.profileService.createProfile(dto).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        this.errorMessage = err.detail || 'Registration failed';
      }
    });
  }
}
