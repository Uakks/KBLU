import { Gender } from "./profile";

export interface Preferences {
    preferredGender: Gender;
    preferredAgeMin: number;
    preferredAgeMax: number;
    preferredUniversity?: string;
    preferredMajor?: string;
}
