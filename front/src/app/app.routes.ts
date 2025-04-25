import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProfileListComponent } from './components/profiles/profile-list/profile-list.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatDetailComponent } from './components/chat-detail/chat-detail.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    {
        path: 'home',
        title: 'Welcome to KBLU',
        component: HomeComponent
    },
    {
        path: 'login',
        title: 'Login',
        component: LoginComponent
    },
    {
        path: 'register',
        title: 'Register',
        component: RegisterComponent
    },
    {
        path: 'profiles',
        title: 'Profile List',
        component: ProfileListComponent
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
];
