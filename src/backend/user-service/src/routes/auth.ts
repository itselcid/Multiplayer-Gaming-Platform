
import { FastifyInstance } from 'fastify';
import { LoginInput, RegisterInput, PasswordResetInput } from '../types';
import { authController } from '../controllers/auth.controller';

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
            username: { type: 'string', minLength: 3, maxLength: 16 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 16 }
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
        required: ['token', 'newpassword'],
        properties: {
            token: { type: 'string' },
            newpassword: { type: 'string', minLength: 8, maxLength: 16 }
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

export default async function authRoutes(server: FastifyInstance): Promise<void> {

    server.post<{ Body: LoginInput }>('/login', { config: StrictRateLimit, schema: LoginSchema }, authController.login);
    server.post<{ Body: RegisterInput }>('/register', { config: StrictRateLimit, schema: RegisterSchema }, authController.register);
    server.post('/logout', authController.logout);
    server.post('/refresh', authController.refresh);
    server.post<{ Body: { email: string } }>('/forgot-password', { schema: ForgotPasswordSchema }, authController.forgotPassword);
    server.post<{ Body: PasswordResetInput }>('/reset-password', { schema: ResetPasswordSchema }, authController.resetPassword);
    server.get('/github', authController.githubLogin);
    server.get<{ Querystring: GitHubCallbackQuery }>('/github/callback', { schema: GitHubCallbackSchema }, authController.githubCallback);
    server.post<{ Body: { code: string } }>('/login/verify', { config: StrictRateLimit, preHandler: [server.authenticate2FA] }, authController.verify2FA);

}
