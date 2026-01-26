import createHttpError from "http-errors";
import { CreateUserInput, GithubProfile } from "../types";
import { createPasswordResetToken, createUser, deletePasswordResetToken, deleteTwoFactorCode, findOrCreateGithubUser, findPasswordResetToken, findTwoFactorCode, generateTwoFactorCode, getUserByRefreshToken, getUserByUsername, getUserForAuth, saveRefreshToken, updateUser } from "../db";
import { tokenService } from "../services/auth.service";
import bcrypt from 'bcrypt';
import { send2faEmailCode, sendPasswordResetEmail } from "../services/email.service";
import { env } from "node:process";
import speakeasy from 'speakeasy';

type GitHubTokenResponse = {
    access_token?: string;
    error?: string;
    error_description?: string;
};

export const authController = {

    login: async (request: any, reply: any) => {

        const { username, password } = request.body;

        if (!password || !username)
            throw createHttpError(400, 'username and password are requierd!');

        const user = await getUserForAuth(username);

        if (!user)
            throw createHttpError(401, 'Invalid username or password!');

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword)
            throw createHttpError(401, 'Invalid username or password!');

        const accessToken = tokenService.generateToken(request.server, user, 'access');
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

        const refreshToken = tokenService.generateToken(request.server, user, 'refresh');
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
    },

    register: async (request: any, reply: any) => {
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
    },

    logout: async (_request: any, reply: any) => {
        tokenService.clearCookie(reply, 'authToken');
        tokenService.clearCookie(reply, 'refreshToken');
        return reply.send({
            message: 'Logout successful. Token invalidated.'
        });
    },

    refresh: async (request: any, reply: any) => {

        const token = request.cookies.refreshToken;
        if (!token)
            throw createHttpError(401, 'Refresh token not found');

        const user = await getUserByRefreshToken(token);

        if (!user)
            throw createHttpError(401, 'Invalid refresh token');

        tokenService.clearCookie(reply, 'authToken');

        const accessToken = tokenService.generateToken(request.server, user, 'access');
        tokenService.setCookie(reply, accessToken, 'authToken');

        return reply.send({
            message: 'Refresh token successful.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    },

    forgotPassword: async (request: any, reply: any) => {
        const { email } = request.body;

        if (!email)
            throw createHttpError(400, 'email is required');

        const user = await getUserByUsername(email);

        if (user) {
            const resetToken = await createPasswordResetToken(user.id);

            await sendPasswordResetEmail(user.email, resetToken.token, user.username);

            return reply.send({
                message: "Password reset email sent successfully",
                // !!! ONLY FOR DEVELOPMENT Remove in production!
                devToken: resetToken.token
            })
        }
        return reply.send({
            message: "Password reset email sent successfully"
        });
    },

    resetPassword: async (request: any, reply: any) => {
        const { token, newpassword } = request.body;

        if (!token || !newpassword)
            throw createHttpError(400, 'token and newpassword are required');

        if (newpassword.length < 4)   //! change to 8 in production
            throw createHttpError(400, 'password must be at least 4 characters long');

        //find and validate token
        const resetToken = await findPasswordResetToken(token);

        if (!resetToken)
            throw createHttpError(400, 'Invalid or expired token');

        await updateUser(resetToken.userId, { password: { newpassword } });
        await deletePasswordResetToken(token);

        return reply.send({
            message: "Password reset successfully"
        })
    },

    githubLogin: async (_request: any, reply: any) => {
        const clientId = env.GITHUB_CLIENT_ID;
        const redirectUri = env.BACKEND_URL + '/api/auth/github/callback';
        const scope = 'read:user user:email';

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        reply.redirect(githubAuthUrl);
    },

    githubCallback: async (request: any, reply: any) => {
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
            const accessToken = tokenService.generateToken(request.server, user, 'access');
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

            const refreshToken = tokenService.generateToken(request.server, user, 'refresh');
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
    },

    verify2FA: async (request: any, reply: any) => {
        const { code } = request.body;

        if (!code)
            throw createHttpError(400, 'Code is required');

        const userId = request.user.userId;

        if (!userId)
            throw createHttpError(400, 'User ID is required');

        const user = await getUserForAuth(request.user.username);

        if (!user)
            throw createHttpError(404, 'User not found');

        tokenService.clearCookie(reply, 'authToken');
        tokenService.clearCookie(reply, 'refreshToken');
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

        const accessToken = tokenService.generateToken(request.server, user, 'access', true);
        tokenService.setCookie(reply, accessToken, 'authToken');

        const refreshToken = tokenService.generateToken(request.server, user, 'refresh');
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
    }

}