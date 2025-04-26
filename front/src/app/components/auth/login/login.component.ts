// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AuthTokens, LoginRequest } from '../../../interfaces/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <h1>Login</h1>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

        <label>
          Username
          <input formControlName="username" />
        </label>

        <label>
          Password
          <input type="password" formControlName="password" />
        </label>

        <button type="submit" [disabled]="loginForm.invalid">Login</button>
      </form>
    </div>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const creds: LoginRequest = this.loginForm.value;
    this.authService.login(creds).subscribe({
      next: (tokens: AuthTokens) => {
        this.router.navigate(['/profiles']);
      },
      error: err => {
        this.errorMessage = err.detail || 'Login failed';
      }
    });
  }
}

