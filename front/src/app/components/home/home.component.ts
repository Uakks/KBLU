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
  // id = '6d58515b-cb6f-4082-a67a-043f0ce8c3b4';

  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    // this.profileService.getProfile(this.id).subscribe({
    //   next: val => console.log(val),
    //   error: err => console.error(err)
    // })
  }
}
