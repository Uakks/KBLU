
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { Profile } from '../../../interfaces/profile';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map, startWith, shareReplay } from 'rxjs/operators';

@Component({
selector: 'app-profile-list',
standalone: true,
imports: [CommonModule, RouterModule, ReactiveFormsModule],
template: `
<div>
Explore Students

  <div class="controls">
    <input [formControl]="searchControl" placeholder="🔍 Search by name..." />
    <select [formControl]="majorControl">
      <option value="">All Majors</option>
      <option *ngFor="let m of majors$ | async" [value]="m">{{ m }}</option>
    </select>
    <select [formControl]="universityControl">
      <option value="">All Universities</option>
      <option *ngFor="let u of universities$ | async" [value]="u">{{ u }}</option>
    </select>
  </div>

  <ng-container *ngIf="filtered$ | async as profiles; else loadingTpl">
    <div *ngIf="profiles.length === 0" class="no-results">
      No students found.
    </div>
    <div class="list-grid">
      <a
        class="card"
        *ngFor="let p of profiles"
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
  searchControl = new FormControl('');
  majorControl = new FormControl('');
  universityControl = new FormControl('');

  profiles$!: Observable<Profile[]>;
  majors$!: Observable<string[]>;
  universities$!: Observable<string[]>;
  filtered$!: Observable<Profile[]>;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    // now this.profileService is available
    this.profiles$ = this.profileService.getCurrentUser().pipe(
      switchMap(me =>
        this.profileService.getProfiles().pipe(
          map(list => list.filter(p => p.id !== me.id))
        )
      ),
      shareReplay(1)
    );

    this.majors$ = this.profiles$.pipe(
      map(list => Array.from(new Set(list.map(p => p.major))).sort())
    );

    this.universities$ = this.profiles$.pipe(
      map(list => Array.from(new Set(list.map(p => p.university))).sort())
    );

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