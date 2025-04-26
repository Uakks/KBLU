import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProfileListComponent } from './components/profiles/profile-list/profile-list.component';
import { ProfileComponent } from './components/profiles/profile/profile.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatDetailComponent } from './components/chat-detail/chat-detail.component';
import { SwipeComponent } from './components/swipe/swipe.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    title: 'Welcome to KBLU',
    component: HomeComponent,
  },
  {
    path: 'login',
    title: 'Login',
    component: LoginComponent,
  },
  {
    path: 'register',
    title: 'Register',
    component: RegisterComponent,
  },
  {
    path: 'profiles',
    title: 'Profile List',
    component: ProfileListComponent,
  },
  { 
    path: 'profiles/:id', 
    title: 'Profile',
    loadComponent: () => import('./components/profiles/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
      path: 'chats',
      title: 'Here is yall chats',
      component: ChatListComponent
  },
  {
      path: 'chats/:id',
      title: 'Chat with ...',
      component: ChatDetailComponent
  },
  {
    path: 'explore',
    title: 'Explore Students',
    component: SwipeComponent
  }
];
