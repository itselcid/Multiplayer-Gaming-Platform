

// src/services/auth.ts
export const tokenService = {
    generateToken: (server: any, user: any, type: string, verified?: boolean) => {
        return server.jwt.sign({
            userId: user.id,
            username: user.username,
            requires2FA: verified ? false : (type === 'access' ? !!user.twoFactor?.enabled : false),
            type: type
        }, { expiresIn: type === 'access' ? '15m' : '7 days' });
    },
    setCookie: (reply: any, token: any, type: string) => {
        reply.setCookie(type, token, {
            httpOnly: true,
            secure: true,       // MUST BE TRUE
            sameSite: 'none',   // MUST BE 'None' for cross-site/port requests
            path: '/',
            maxAge: type === 'authToken' ? 15 * 60 : 7 * 24 * 60 * 60     // 15m for access token, 7d for refresh token      
        });
    },
    clearCookie: (reply: any, type: string) => {
        reply.clearCookie(type, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });
    }
};