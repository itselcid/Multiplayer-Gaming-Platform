
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import {
    createUser,
    getUserByUsername,
    createPasswordResetToken,
    findPasswordResetToken,
    deletePasswordResetToken,
    updateUser,
    prisma,
    findOrCreateGithubUser
} from "../db.js";
import { sendPasswordResetEmail } from '../services/email.js';


async function authRoutes(server, ops) {

    // Route 1: login using username and password
    server.post('/login', async (request, reply) => {
        const { username, password } = request.body

        if (!password || !username) {
            reply.code(400)
            return { error: "username and password are requierd!" }
        }
        
        try {
            const user = await getUserByUsername(username)


            if (user) {
                const isMatch = await bcrypt.compare(password, user.password)

                if (isMatch) {
                    const jwtkn = jwt.sign(
                        {
                            userId: user.id,
                            username: user.username,
                            role: user.role
                        },
                        process.env.JWT_SEC,
                        { expiresIn: '7d' } // 7 days short term token
                    )


                    // Backend code modification (Recommended for cross-origin/cross-port)
                    reply.setCookie('authToken', jwtkn, {
                        httpOnly: true,
                        secure: true,   // 👈 MUST BE TRUE
                        sameSite: 'None', // 👈 MUST BE 'None' for cross-site/port requests
                        path: '/',
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    })

                    return reply.send ({
                        message: 'Login successful',
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }
                    })
                }
            }
            reply.code(401)
            return { error: 'Invalid username or password' }

        } catch (err) {
            // console.log(err)
            reply.code(500)
            return { error: 'Internal server error' }
        }
    })

    // Route 2: register a new user
    server.post('/register', async (request, reply) => {
        const { username, email, password } = request.body
        
        if (!username || !email || !password) {
            reply.code(400)
            return { error: "username, email and password are required" }
        }
        
        if (password && password.length < 4) {
            reply.code(400)
            return { error: 'Password must be at least 4 characters' }
        }

        try {
            const user = await createUser(username, email, password, 'user')

            reply.code(201)
            return {
                message: 'User registered successfully',
                user
            }

        } catch (err) {
            reply.code(400)
            return { error: 'Username or email already exists' }
        }

    })

    // Route 3: request password reset
    server.post('/forgot-password', async (request, reply) => {
        const { email } = request.body

        if (!email) {
            reply.code(400)
            return { error: 'Email is required!' }
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email }
            })

            if (user) {
                const resetToken = await createPasswordResetToken(user.id)

                await sendPasswordResetEmail(email, resetToken.token, user.username)

                return { 
                    message: 'A reset link has been sent',
                    // !!! ONLY FOR DEVELOPMENT Remove in production!
                    devToken: resetToken.token 
                }
            }
            return { message: 'A reset link has been sent' }
        } catch (err) {
            reply.code(500)
            return { error: 'Internal server error', err }
        }
    })

    // Route 4: Reset password with token
    server.post('/reset-password', async (request, reply) => {
        const { token, newPassword } = request.body
        
        if (!token || !newPassword) {
            reply.code(400)
            return { error: 'Token and new password are required' }
        }
        
        if (newPassword.length < 4) {
            reply.code(400)
            return { error: 'Password must be at least 4 characters' }
        }
        
        try {
            // Find and validate token
            const resetToken = await findPasswordResetToken(token)
            
            if (!resetToken) {
                reply.code(400)
                return { error: 'Invalid or expired token' }
            }

            await updateUser(resetToken.userId, { password: newPassword })
            await deletePasswordResetToken(token)
            
            return { message: 'Password reset successfully' }

        } catch (err) {
            reply.code(500)
            return { error: 'Server error' }
        }
    })

    // Route 5: begin Github Auth
    server.get('/github', async (request, reply) => {
        const clientId = process.env.GITHUB_CLIENT_ID
        const redirectUri = 'http://localhost:3000/api/auth/github/callback'
        const scope = 'read:user user:email'

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`

        reply.redirect(githubAuthUrl)

    })

    // Route 6: github OAuth callback
    server.get('/github/callback', async (request, reply) => {
        const { code } = request.query

        if (!code) {
            reply.code(400)
            return { error: 'Authorization code not provided' }
        }

        try {
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code
                })
            })

            const tokenData = await tokenResponse.json()
            if (tokenData.error) {
                reply.code(400)
                return { error: tokenData.error_description }
            }

            const githubAccessToken = tokenData.access_token

            // Get user info with token
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${githubAccessToken}`,
                    'Accept': 'application/json'
                }
            })

            const githubUser = await userResponse.json()

            // create a user in our database matching github user
            const user = await findOrCreateGithubUser(githubUser)

            const jwtkn = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SEC,
                { expiresIn: '7d' } // 7 days short term token
            )

            // Redirect to frontend with tokens
            // In production, i will redirect to the frontend app
            // For now, return JSON

            return {
                message: 'Github auth successful',
                token: jwtkn,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            }


        } catch (err) {
            console.error('[!] - GitHub OAuth error:', err)
            reply.code(500)
            return { error: 'Authentication failed' }
        }
    })

}

export default authRoutes;
