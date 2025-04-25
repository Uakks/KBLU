export type Gender = 'male' | 'female';

export interface Profile {
    id: string;                      // UUID
    user: number;                    // user ID
    username: string;
    fullName: string;
    university: string;
    major: string;
    location: string;
    gender: Gender;
    age: number;
    profilePicture?: string;         // URL or undefined

    preferredGender: Gender;
    preferredAgeMin: number;
    preferredAgeMax: number;
    preferredUniversity?: string;
    preferredMajor?: string;
}

export interface ProfileCreateRequest {
    username: string;
    password: string;
    email: string;
    fullName: string;
    university: string;
    major: string;
    location: string;
    gender: Gender;
    age: number;
    profilePicture?: string;

    preferredGender: Gender;
    preferredAgeMin: number;
    preferredAgeMax: number;
    preferredUniversity?: string;
    preferredMajor?: string;
}