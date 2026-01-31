import createHttpError from "http-errors";
import { createTwoFactor, deleteTwoFactor, deleteTwoFactorCode, findTwoFactorCode, generateTwoFactorCode, getUserForAuth, updateTwoFactor } from "../db";
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { send2faEmailCode } from "../services/email.service";


export const twoFactorController = {
    setupTwoFactorAuth: async (request: any, reply: any) => {
        const { method, password } = request.body;
        const userId = request.user.userId; // from JWT payload

        const user = await getUserForAuth(request.user.username);

        if (!user)
            throw createHttpError(404, 'User not found');

        // 2. Check if 2FA already exists
        if (user.twoFactor)
            throw createHttpError(400, '2FA is already configured. Please delete existing setup first.');

        // 3. Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword)
            throw createHttpError(401, 'Invalid password');

        // 4. save settings
        if (method === 'email') {
            await createTwoFactor(userId, null);
        } else {
            const secret = speakeasy.generateSecret({
                name: `trandandan (${user.username})`,
                issuer: 'trandandan'
            });

            await createTwoFactor(userId, secret.base32);

            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            return reply.send({
                method: 'totp',
                secret: secret.base32,        // For manual entry if QR fails
                qrCode: qrCodeUrl,           // Base64 image: data:image/png;base64,...
                message: 'Scan QR code with Google Authenticator'
            });

        }

        // 5. generate code
        const code = await generateTwoFactorCode(userId);

        // 6. Send email
        await send2faEmailCode(user.email, code);

        return reply.send({
            message: 'Verification code sent to your email',
            expiresIn: '10 minutes'
        });
    },

    confirmTwoFactorAuth: async (request: any, reply: any) => {
        const { code } = request.body;

        if (!code)
            throw createHttpError(400, 'Code is required');

        const user = await getUserForAuth(request.user.username);

        if (!user)
            throw createHttpError(404, 'User not found');
        if (!user.twoFactor)
            throw createHttpError(400, '2FA is not configured');

        const totpSecret = user.twoFactor.totpSecret;

        if (user.twoFactor.method === 'totp' && totpSecret) {
            const isValid = speakeasy.totp.verify({
                secret: totpSecret,
                encoding: 'base32',
                token: code,
                window: 2  // Accept codes from ±60 seconds (allows clock drift)
            });

            if (!isValid)
                throw createHttpError(401, 'Invalid code');
        } else {
            const isValidCode = await findTwoFactorCode(code);

            if (!isValidCode || isValidCode.code !== code)
                throw createHttpError(401, 'Invalid code');

            await deleteTwoFactorCode(request.user.userId);
        }
        await updateTwoFactor(request.user.userId);
        return reply.send({
            message: '2FA enabled successfully'
        });
    },

    deleteTwoFactorAuth: async (request: any, reply: any) => {
        const { password } = request.body;
        const userId = request.user.userId; // from JWT payload

        const user = await getUserForAuth(request.user.username);

        if (!user)
            throw createHttpError(404, 'User not Found');
        if (!user.twoFactor)
            throw createHttpError(400, '2FA is not configured');

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword)
            throw createHttpError(401, 'Invalid password');

        await deleteTwoFactor(userId);
        await deleteTwoFactorCode(userId);

        return reply.send({
            message: '2FA disabled successfully'
        });
    }
}