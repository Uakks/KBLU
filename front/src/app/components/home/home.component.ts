import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <p>
      home works!
    </p>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.getProfiles().subscribe({
      next: val => console.log(val),
      error: err => console.error(err)
    })
  }
}
