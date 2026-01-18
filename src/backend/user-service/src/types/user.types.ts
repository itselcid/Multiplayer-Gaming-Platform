


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
    twoFactor?: {
        method: string | null;
        enabled?: boolean;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSearchData {
    id: number;
    username: string;
    avatar: string;
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
}


export interface MatchResult {
    player1Id: number;
    player2Id?: number; // Optional, might be null if guest
    score1: number;
    score2: number;
    startedAt: string; // ISO string
}

