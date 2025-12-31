
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { LoginInput, RegisterInput, CreateUserInput, PasswordResetInput, GithubProfile } from '../types';
import { createPasswordResetToken, createUser, deletePasswordResetToken, deleteTwoFactorCode, findOrCreateGithubUser, findPasswordResetToken, findTwoFactorCode, generateTwoFactorCode, getUserByRefreshToken, getUserByUsername, getUserForAuth, saveRefreshToken, updateUser } from '../db';
import { send2faEmailCode, sendPasswordResetEmail } from '../services/email.js';
import speakeasy from 'speakeasy';
import { env } from '../env';
import createHttpError from 'http-errors';
import { tokenService } from '../services/auth';

const LoginSchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' }
        }
    }
} as const;

const RegisterSchema = {
    body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: { type: 'string', minLength: 4, maxLength: 16 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 4, maxLength: 16 }  // also change in production
        }
    }
} as const;

export const StrictRateLimit = {
    rateLimit: {
        max: 5,
        timeWindow: '1 minute'
    }
} as const;

const ForgotPasswordSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' }
        }
    }
} as const;

const ResetPasswordSchema = {
    body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
            token: { type: 'string' },
            password: { type: 'string' }
        }
    }
} as const;

const GitHubCallbackSchema = {
    querystring: {
        type: 'object',
        required: ['code'],
        properties: {
            code: { type: 'string' }
        }
    }
} as const;

type GitHubCallbackQuery = {
    code?: string;
};

type GitHubTokenResponse = {
    access_token?: string;
    error?: string;
    error_description?: string;
};

export default async function authRoutes(server: FastifyInstance): Promise<void> {

    // login endpoint
    server.post<{
        Body: LoginInput
    }>('/login', {
        config: StrictRateLimit, // more strict rate limit for login 5/min 
        schema: LoginSchema
    }, async (request, reply) => {

        const { username, password } = request.body;

        if (!password || !username)
            throw createHttpError(400, 'username and password are requierd!');

        const user = await getUserForAuth(username);

        if (!user)
            throw createHttpError(401, 'Invalid username or password!');

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword)
            throw createHttpError(401, 'Invalid username or password!');

        const accessToken = tokenService.generateToken(server, user, 'access');
        tokenService.setCookie(reply, accessToken, 'authToken');

        if (user.twoFactor?.enabled) {
            let code: string | undefined;
            if (user.twoFactor.method === 'email') {
                code = await generateTwoFactorCode(user.id);
                await send2faEmailCode(user.email, code);
            }

            return reply.send({
                message: code ? 'need to verify 2FA, code sent to your email' : 'need to verify 2FA, use TOTP',
                requires2FA: true,
                devCode: code,
                expiresIn: '10 minutes'
            });
        }

        const refreshToken = tokenService.generateToken(server, user, 'refresh');
        await saveRefreshToken(user.id, refreshToken);
        tokenService.setCookie(reply, refreshToken, 'refreshToken');

        return reply.send({
            message: 'Login successful',
            user: {   // use interface later
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });

    // register endpoint
    server.post<{
        Body: RegisterInput
    }>('/register', {
        config: StrictRateLimit,
        schema: RegisterSchema
    }, async (request, reply) => {
        const { username, email, password } = request.body;

        if (!username || !email || !password)
            throw createHttpError(400, 'username, email and password are required');

        if (password.length < 4) // weaker password for development
            throw createHttpError(400, 'password must be at least 4 characters long');

        const newUser: CreateUserInput = {
            username,
            email,
            password
        }


        const existingUser = await getUserByUsername(username, email);

        if (existingUser)
            throw createHttpError(409, 'User with this username or email already exists');

        const user = await createUser(newUser);

        if (!user)
            throw createHttpError(500);

        return reply.code(201).send({
            message: "User created successfully",
            user
        });
    });

    // logout endpoint
    server.post('/logout', async (_request, reply) => {
        tokenService.clearCookie(reply, 'authToken');
        tokenService.clearCookie(reply, 'refreshToken');
        return reply.send({
            message: 'Logout successful. Token invalidated.'
        });
    });

    // refresh access token endpoint
    server.post('/refresh', async (_request, reply) => {

        const token = _request.cookies.refreshToken;
        if (!token)
            throw createHttpError(401, 'Refresh token not found');

        const user = await getUserByRefreshToken(token);

        if (!user)
            throw createHttpError(401, 'Invalid refresh token');

        tokenService.clearCookie(reply, 'authToken');

        const accessToken = tokenService.generateToken(server, user, 'access');
        tokenService.setCookie(reply, accessToken, 'authToken');

        return reply.send({
            message: 'Refresh token successful.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });

    // forget password endpoint
    server.post<{
        Body: { email: string }
    }>('/forgot-password', {
        schema: ForgotPasswordSchema
    }, async (request, reply) => {
        const { email } = request.body;

        if (!email)
            throw createHttpError(400, 'email is required');

        const user = await getUserByUsername(email);

        if (user) {
            const resetToken = await createPasswordResetToken(user.id);

            await sendPasswordResetEmail(user.email, resetToken.token);

            return reply.send({
                message: "Password reset email sent successfully",
                // !!! ONLY FOR DEVELOPMENT Remove in production!
                devToken: resetToken.token
            })
        }
        return reply.send({
            message: "Password reset email sent successfully"
        })
    });

    // reset password endpoint
    server.post<{
        Body: PasswordResetInput
    }>('/reset-password', {
        schema: ResetPasswordSchema
    }, async (request, reply) => {
        const { token, password } = request.body;

        if (!token || !password)
            throw createHttpError(400, 'token and password are required');

        if (password.length < 4)   //! change to 8 in production
            throw createHttpError(400, 'password must be at least 4 characters long');

        //find and validate token
        const resetToken = await findPasswordResetToken(token);

        if (!resetToken)
            throw createHttpError(400, 'Invalid or expired token');

        await updateUser(resetToken.userId, { password });
        await deletePasswordResetToken(token);

        return reply.send({
            message: "Password reset successfully"
        })
    });

    // github login endpoint
    server.get('/github', async (_request, reply) => {
        const clientId = env.GITHUB_CLIENT_ID;
        const redirectUri = 'http://localhost:3000/api/auth/github/callback';  // change this to var
        const scope = 'read:user user:email';

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        reply.redirect(githubAuthUrl);
    });

    // GitHub OAuth callback endpoint
    server.get<{
        Querystring: GitHubCallbackQuery  // generic type argument
    }>('/github/callback', {
        schema: GitHubCallbackSchema
    }, async (request, reply) => {
        const { code } = request.query;

        if (!code)
            throw createHttpError(400, 'Authorization code not provided');

        try {
            // Exchange code for access token
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: env.GITHUB_CLIENT_ID,
                    client_secret: env.GITHUB_CLIENT_SECRET,
                    code
                })
            });

            const tokenData = await tokenResponse.json() as GitHubTokenResponse;

            if (tokenData.error)
                throw createHttpError(400, tokenData.error_description || 'GitHub authentication failed');

            if (!tokenData.access_token)
                throw createHttpError(400, 'No access token received');

            const githubAccessToken = tokenData.access_token;

            // Get user info with token
            const githubUserResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${githubAccessToken}`,
                    'Accept': 'application/json'
                }
            });

            const githubUser = await githubUserResponse.json() as GithubProfile;

            // Create or find user in database
            const user = await findOrCreateGithubUser(githubUser);

            // Generate JWT token   
            const accessToken = tokenService.generateToken(server, user, 'access');
            tokenService.setCookie(reply, accessToken, 'authToken');

            if (user.twoFactor?.enabled) {
                let code: string | undefined;
                if (user.twoFactor.method === 'email') {
                    code = await generateTwoFactorCode(user.id);
                    await send2faEmailCode(user.email, code);
                    console.log('> > > code sent to email: ' + code);
                }

                return reply.redirect(`${env.FRONTEND_URL}/login/verify`, 303);
            }

            const refreshToken = tokenService.generateToken(server, user, 'refresh');
            await saveRefreshToken(user.id, refreshToken);
            tokenService.setCookie(reply, refreshToken, 'refreshToken');

            // Redirect to frontend
            return reply.redirect(`${env.FRONTEND_URL}/profile`, 303);

        } catch (err: any) {
            console.error('[GitHub OAuth error]:', err);
            if (err instanceof createHttpError.HttpError)
                throw createHttpError(err.statusCode, err.message);
            throw createHttpError(500, 'Authentication failed');
        }
    });

    // 2fa verification
    server.post<{
        Body: { code: string }
    }>('/login/verify', {
        config: StrictRateLimit,
        preHandler: [server.authenticate2FA]
    }, async (request, reply) => {

        const { code } = request.body;

        if (!code)
            throw createHttpError(400, 'Code is required');

        const userId = request.user.userId;

        if (!userId)
            throw createHttpError(400, 'User ID is required');

        const user = await getUserForAuth(request.user.username);

        if (!user)
            throw createHttpError(404, 'User not found');

        if (user.twoFactor.method === 'email') {
            const isValidCode = await findTwoFactorCode(code);

            if (!isValidCode || isValidCode.code !== code)
                throw createHttpError(401, 'Invalid code');

            await deleteTwoFactorCode(userId);
        } else if (user.twoFactor.method === 'totp') {
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactor.totpSecret,
                encoding: 'base32',
                token: code,
                window: 2
            });
            if (!isValid)
                throw createHttpError(401, 'Invalid code');
        }

        const accessToken = tokenService.generateToken(server, user, 'access', true);
        tokenService.setCookie(reply, accessToken, 'authToken');

        const refreshToken = tokenService.generateToken(server, user, 'refresh');
        await saveRefreshToken(user.id, refreshToken);
        tokenService.setCookie(reply, refreshToken, 'refreshToken');

        return reply.send({
            message: '2FA verified successfully',
            user: {   // use interface later
                id: user.id,
                username: user.username,
                requires2FA: false
            }
        });

    });

}
