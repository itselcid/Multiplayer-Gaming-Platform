
import { prisma } from "./config/db";
import { TwoFactorCode, UserTwoFactor } from "@prisma/client";
import bcrypt from "bcrypt";
import { UserData, CreateUserInput, UpdateUserInput, PasswordResetToken, UserSearchData, MatchResult } from "./types";
import type { GithubProfile, UserAuthData } from "./types/auth.types.js";
import crypto from 'crypto';
import createHttpError from "http-errors";

export async function createUser(input: CreateUserInput): Promise<UserSearchData> {
    const { username, email, password } = input;

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hash,
            avatar: '/public/default-avatar.png',
        },
        select: {
            id: true,
            username: true,
            avatar: true,
            createdAt: true
        }
    });

    return user;
}

export async function getAllUsers(): Promise<UserData[]> {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            twoFactor: {
                select: {
                    method: true
                }
            },
            githubId: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return users;
}

export async function getUserById(id: number): Promise<UserData | null> {

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            twoFactor: {
                select: {
                    method: true,
                    enabled: true
                }
            },
            githubId: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;
}

export async function getUserByUsername(usernameOrEmail: string, email?: string): Promise<UserData | null> {
    const whereClause = email
        ? {
            OR: [
                { username: usernameOrEmail },
                { email: email }
            ]
        }
        : {
            OR: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        };

    const user = await prisma.user.findFirst({
        where: whereClause,
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            twoFactor: {
                select: {
                    method: true,
                    enabled: true
                }
            },
            githubId: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return user;
}

export async function searchUsers(search: string): Promise<UserSearchData[]> {
    const users = await prisma.user.findMany({
        where: {
            username: search
        },
        select: {
            id: true,
            username: true,
            avatar: true
        }
    });
    return users;
}

// For authentication (WITH password)
export async function getUserForAuth(username: string, id?: number): Promise<UserAuthData> {

    const whereClause = id ? { id } : { username };
    const user = await prisma.user.findUnique({
        where: whereClause,
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            twoFactor: {
                select: {
                    method: true,
                    totpSecret: true,
                    enabled: true
                }
            },
            githubId: true,
            password: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return user;
}

export async function updateUser(id: number, updates: UpdateUserInput): Promise<UserData | null> {
    const data: any = {};

    if (updates.email !== undefined) {
        const user = await getUserByUsername(updates.email);
        if (user)
            throw createHttpError(409, 'Email already exists');
        data.email = updates.email;
    }

    if (updates.username !== undefined) {
        const user = await getUserByUsername(updates.username);
        if (user)
            throw createHttpError(409, 'Username already exists');
        data.username = updates.username;
    }

    if (updates.password !== undefined) {
        const { oldpassword, newpassword, repeatednewpasswd } = updates.password;
        console.log("oldpassword: ", oldpassword || "undefined");
        console.log("newpassword: ", newpassword || "undefined");
        console.log("repeatednewpasswd: ", repeatednewpasswd || "undefined");
        const user = await getUserForAuth('auth', id);

        if (!user)
            throw createHttpError(404, 'User not found');

        if (oldpassword && repeatednewpasswd) {
            const isPasswordValid = await bcrypt.compare(oldpassword, user.password);
            if (!isPasswordValid)
                throw createHttpError(401, 'Invalid password');

            if (newpassword !== repeatednewpasswd)
                throw createHttpError(400, 'Passwords do not match');
        }

        const hash = await bcrypt.hash(newpassword, 10);
        data.password = hash;
    }

    if (updates.avatar !== undefined) {
        data.avatar = updates.avatar;
    }

    const user = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            twoFactor: {
                select: {
                    method: true
                }
            },
            githubId: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;

}

export async function deleteUser(id: number): Promise<UserData | null> {
    const user = await prisma.user.delete({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            twoFactor: {
                select: {
                    method: true
                }
            },
            githubId: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;
}

export async function findOrCreateGithubUser(profile: GithubProfile): Promise<UserData> {

    const gitHubUserId = profile.id.toString();

    let user = await prisma.user.findUnique({
        where: { githubId: gitHubUserId }
    })

    if (user) {
        // user already exists linked with github
        if (user.avatar !== profile.avatar_url) {
            // if users avatar changed in github we change it here as well
            await prisma.user.update({
                where: { id: user.id },
                data: { avatar: profile.avatar_url }
            })
        }
        return user;
    }

    // creating a new user for this github account
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username: profile.login + counter } })) {
        counter++;
    }

    user = await prisma.user.create({
        data: {
            username: profile.login + counter,
            email: profile.email || `${profile.login}@github.com`,
            avatar: profile.avatar_url,
            githubId: gitHubUserId
        }
    })

    return user;
}

export async function createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    const token = crypto.randomBytes(12).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const resetToken = await prisma.passwordReset.create({
        data: {
            token,
            userId,
            expiresAt
        }
    });

    return resetToken;
}


export async function findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const resetToken = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true }
    });

    if (!resetToken) {
        return null;
    }

    if (resetToken.expiresAt < new Date()) {
        await prisma.passwordReset.delete({
            where: { id: resetToken.id }
        });
        return null;
    }

    return resetToken;
}

export async function findTwoFactorCode(userCode: string): Promise<TwoFactorCode | null> {
    const code = await prisma.twoFactorCode.findFirst({
        where: { code: userCode }
    });

    if (!code) {
        console.error('\x1b[31m%s\x1b[0m', "No 2FA code found for user");
        return null;
    }

    if (code.expiresAt < new Date()) {
        console.error('\x1b[31m%s\x1b[0m', "2FA code expired for user");
        await prisma.twoFactorCode.delete({
            where: { id: code.id }
        });
        return null;
    }

    console.log('2FA code found for user ', "code: ", code.code);
    return code;
}

export async function updateTwoFactor(userId: number): Promise<UserTwoFactor> {
    const twoFactor = await prisma.userTwoFactor.update({
        where: { userId },
        data: { enabled: true }
    });
    return twoFactor;
}

export async function deletePasswordResetToken(token: string): Promise<void> {
    await prisma.passwordReset.delete({
        where: { token }
    })
}

export async function saveRefreshToken(userId: number, refreshToken: string) {
    await prisma.refreshToken.create({
        data: {
            userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    })
}

export async function getUserByRefreshToken(token: string): Promise<UserData | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
        where: { token }
    });

    if (!refreshToken) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: refreshToken.userId }
    });

    return user;
}

export async function createTwoFactor(userId: number, secret: string | null) {
    // 2. Save 2FA config (disabled by default)

    if (secret) {
        await prisma.userTwoFactor.create({
            data: {
                userId,
                method: 'totp',
                totpSecret: secret
            }
        });
    } else {
        await prisma.userTwoFactor.create({
            data: {
                userId,
                method: 'email'
            }
        });
    }
}

export async function deleteTwoFactor(userId: number) {
    await prisma.userTwoFactor.delete({
        where: { userId }
    });
}


export async function generateTwoFactorCode(userId: number) {
    // 1. Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 2. Save verification code
    await prisma.twoFactorCode.create({
        data: {
            userId,
            code,
            expiresAt
        }
    });

    return code;
}

export async function deleteTwoFactorCode(userId: number) {
    await prisma.twoFactorCode.deleteMany({
        where: { userId }
    });
}


// Friendships functions
export async function sendFriendRequest(requesterId: number, addresseeId: number) {
    const existing = await getFriendship(requesterId, addresseeId);
    if (existing) {
        if (existing.status === 'BLOCKED') throw new Error('Cannot send request');
        if (existing.status === 'ACCEPTED') throw new Error('Already friends');
        if (existing.status === 'PENDING') throw new Error('Request already pending');
    }

    await prisma.friendship.create({
        data: {
            requesterId,
            addresseeId,
            status: 'PENDING'
        }
    });
}

export async function acceptFriendRequest(userId: number, friendId: number) {
    // Find the friendship where friendId sent request to userId
    const friendship = await prisma.friendship.findFirst({
        where: {
            requesterId: friendId,
            addresseeId: userId,
            status: 'PENDING'
        }
    });

    if (!friendship) {
        throw new Error('Friend request not found');
    }

    await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'ACCEPTED' }
    });
}

export async function removeFriend(userId: number, friendId: number) {
    // Delete friendship in either direction
    await prisma.friendship.deleteMany({
        where: {
            OR: [
                { requesterId: userId, addresseeId: friendId },
                { requesterId: friendId, addresseeId: userId }
            ]
        }
    });
}

export async function blockFriend(userId: number, friendId: number) {
    // 1. Remove any existing relationship
    await removeFriend(userId, friendId);

    // 2. Create new BLOCK record where requester = blocker
    await prisma.friendship.create({
        data: {
            requesterId: userId,
            addresseeId: friendId,
            status: 'BLOCKED'
        }
    });
}

export async function unblockFriend(userId: number, friendId: number) {
    // Only unblock if userId attempted to block friendId
    await prisma.friendship.deleteMany({
        where: {
            requesterId: userId,
            addresseeId: friendId,
            status: 'BLOCKED'
        }
    });
}

export async function getFriends(userId: number) {
    const friends = await prisma.friendship.findMany({
        where: {
            OR: [
                {
                    requesterId: userId,
                    status: 'ACCEPTED'
                },
                {
                    addresseeId: userId,
                    status: 'ACCEPTED'
                }
            ]
        },
        include: {
            requester: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            addressee: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    return friends.map(f => {
        return f.requesterId === userId ? f.addressee : f.requester;
    });
}

export async function getFriendship(userId: number, otherUserId: number) {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: userId, addresseeId: otherUserId },
                { requesterId: otherUserId, addresseeId: userId }
            ]
        },
        select: {
            id: true,
            status: true,
            requesterId: true,
            addresseeId: true
        }
    });
    return friendship;
}


export async function getReceivedFriendRequests(addresseeId: number) {
    const friendRequests = await prisma.friendship.findMany({
        where: {
            addresseeId,
            status: 'PENDING'
        },
        select: {
            requesterId: true,
            requester: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    return friendRequests;
}

export async function getBlockedFriends(userId: number) {
    const blockedFriends = await prisma.friendship.findMany({
        where: {
            requesterId: userId,
            status: 'BLOCKED'
        },
        select: {
            addresseeId: true,
            addressee: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    return blockedFriends;
}

export async function getSentFriendRequests(requesterId: number) {
    const friendRequestsSent = await prisma.friendship.findMany({
        where: {
            requesterId,
            status: 'PENDING'
        },
        select: {
            addressee: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        }
    });

    return friendRequestsSent;
}

export async function saveMatch(matchData: MatchResult) {
    try {
        // Verifying player 1 exists
        const player1 = await prisma.user.findUnique({ where: { id: matchData.player1Id } });
        if (!player1) {
            console.warn(`User ${matchData.player1Id} not found, skipping match save.`);
            return;
        }

        // Verifying player 2 if provided (it can be a player vs guest situation)
        let player2Id: number | null = null;
        if (matchData.player2Id) {
            const player2 = await prisma.user.findUnique({ where: { id: matchData.player2Id } });
            if (player2) {
                player2Id = player2.id;
            }
        }

        await prisma.match.create({
            data: {
                player1Id: matchData.player1Id,
                player2Id: player2Id,
                score1: matchData.score1,
                score2: matchData.score2,
                startedAt: new Date(matchData.startedAt)
            }
        });
        console.log(`Match saved to DB`, matchData); //! logs
    } catch (error) {
        console.error('Error saving match to DB:', error);
        throw error;
    }
}



/////// Temporary ///////
export async function createTestUserIfNeeded() {
    const user = await getUserByUsername('test')

    if (!user) {
        const testUser = await createUser({
            username: 'test',
            email: 'test@test.com',
            password: 'test'
        })
        if (testUser)
            console.log("\x1b[32m%s\x1b[0m", 'Test user created: username=test, password=test')
    }
}

