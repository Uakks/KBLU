export interface Swipe {
    id: number;
    from_profile: string;
    to_profile: string;
    decision: 'like' | 'reject';
    timestamp: string;
}

export interface SwipeCreate {
    from_profile: string;
    to_profile: string;
    decision: 'like' | 'reject';
}