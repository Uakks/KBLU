import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../interfaces/profile';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="list-wrapper">
      <h1>Explore Students</h1>
      <div class="controls">
        <input [formControl]="searchControl" placeholder="🔍 Search by name..." />
        <select [formControl]="majorControl">
          <option value="">All Majors</option>
          <option *ngFor="let m of majors" [value]="m">{{ m }}</option>
        </select>
        <select [formControl]="universityControl">
          <option value="">All Universities</option>
          <option *ngFor="let u of universities" [value]="u">{{ u }}</option>
        </select>
      </div>

      <ng-container *ngIf="!loading; else loadingTpl">
        <div *ngIf="error" class="error">{{ error }}</div>
        <div class="list-grid" *ngIf="!error">
          <a
            class="card"
            *ngFor="let p of filtered$ | async"
            [routerLink]="['/profiles', p.id]"
          >
            <div class="card-image">
              <img [src]="p.profilePicture || 'assets/default-avatar.png'" alt="{{ p.fullName }}" />
            </div>
            <div class="card-content">
              <h4>{{ p.fullName }}</h4>
              <p class="username">{{ p.username }}</p>
              <p class="sub">{{ p.university }} · {{ p.major }}</p>
            </div>
          </a>
        </div>
      </ng-container>

      <ng-template #loadingTpl>
        <p class="loading">Loading profiles…</p>
      </ng-template>
    </div>
  `,
  styleUrls: ['./profile-list.component.css'],
})
export class ProfileListComponent implements OnInit {
  profiles$ = new BehaviorSubject<Profile[]>([]);
  filtered$!: Observable<Profile[]>;
  loading = true;
  error: string | null = null;

  searchControl = new FormControl('');
  majorControl = new FormControl('');
  universityControl = new FormControl('');

  majors: string[] = [];
  universities: string[] = [];
  private currentUserId!: string;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getCurrentUser().pipe(
      switchMap(me =>
        this.profileService.getProfiles().pipe(
          map(list => ({ me, list }))
        )
      )
    ).subscribe({
      next: ({ me, list }) => {
        this.currentUserId = me.id;
        const filtered = list.filter(p => p.id !== this.currentUserId);
        this.profiles$.next(filtered);

        this.majors = Array.from(new Set(filtered.map(p => p.major))).sort();
        this.universities = Array.from(new Set(filtered.map(p => p.university))).sort();

        this.setupFiltering();
        this.loading = false;
      },
      error: err => {
        this.error = 'Could not load profiles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private setupFiltering() {
    this.filtered$ = combineLatest([
      this.profiles$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.majorControl.valueChanges.pipe(startWith('')),
      this.universityControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([list, name, major, uni]) =>
        list.filter(p =>
          (!name || p.fullName.toLowerCase().includes(name.toLowerCase())) &&
          (!major || p.major === major) &&
          (!uni || p.university === uni)
        )
      )
    );
  }
}

