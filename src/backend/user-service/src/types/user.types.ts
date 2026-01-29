


export type User = {
    id: number;
    email: string;
    password: string | null;
    avatar: string | null;
    githubId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserData {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
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

export interface UserSearchData {
    id: number;
    username: string;
    avatar: string;
    xp: number;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
}

export interface CreateUserOutput {
    id: number;
    email: string;
    username: string;
}

export interface PasswordUpdateInput {
    oldpassword?: string;
    newpassword: string;
    repeatednewpasswd?: string;
}

export interface UpdateUserInput {
    email?: string;
    username?: string;
    password?: PasswordUpdateInput;
    avatar?: string;
}

export interface LoginInput {
    username: string;
    password: string;
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface Friend {
    id: number;
    username: string;
    avatar: string | null;
    isOnline?: boolean;
}


export interface MatchResult {
    player1Id: number;
    player2Id?: number; // Optional, might be null if guest
    score1: number;
    score2: number;
    startedAt: string; // ISO string
}

export interface MatchHistory {
    player1Id: number;
    player1: {
        id: number;
        username: string;
        avatar: string;
    };
    player2Id: number;
    player2: {
        id: number;
        username: string;
        avatar: string;
    };
    player1Score: number;
    player2Score: number;
    playedAt: Date;
}


export interface MatchResult {
    player1Id: number;
    player2Id?: number; // Optional, might be null if guest
    score1: number;
    score2: number;
    startedAt: string; // ISO string
}

