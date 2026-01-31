
// the User type based on backend response
export interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    xp: number;
    twoFactor?: {
        method: string | null;
        enabled?: boolean;
    } | null;
    achievements?: {
        unlockedAt: Date;
        achievement: {
            id: number;
            key: string;
            name: string;
            description: string;
            icon: string;
        };
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SignResponse {
    message: string;
    user: User;
}

export interface LoginResponse {
    message: string;
    user?: User;
    requires2FA?: boolean;
    method?: 'email' | 'totp';
}

export interface UserAchievement {
    unlockedAt: Date;
    achievement: {
        id: number;
        key: string;
        name: string;
        description: string;
        icon: string;
    };
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    achievements?: UserAchievement[];
}