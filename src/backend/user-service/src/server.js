
import 'dotenv/config'

import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import fs from 'fs'
import cors from '@fastify/cors'
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import { initializeTempData } from './db.js';
import { testEmailConnection } from './services/email.js'






// init Fastify instance and database
const server = Fastify({ logger: true })





import fastifyCookie from '@fastify/cookie';
// 
// ADD THIS BLOCK 
await server.register(fastifyCookie, {
    // IMPORTANT: Use a strong, unique secret from environment variables in a real app
    secret: process.env.COOKIE_SECRET || "super-secure-default-secret-key-12345"
});

// testing email connection on startup 
await testEmailConnection()


await server.register(swagger, {
    mode: 'static',
    specification: {
        path: './openapi.yaml',   // change it later
        baseDir: process.cwd(),
    }
})

await server.register(swaggerUI, {
    routePrefix: '/docs', // URL where Swagger UI will be served
})

// the following code is a fix for the options request check for Cross Origin Resource Sharing
// Register CORS 
await server.register(cors, {
    origin: [ process.env.FRONTEND_URL ],   // diffrent host is needed for 127.0.0.1
    credentials: true  // for siting cookies to work 
});

// registering Routes
server.register(userRoutes, { prefix: '/api/users' })
server.register(authRoutes, { prefix: '/api/auth' })


// rate limite?
server.get('/health', async (request, reply) => {
  return { status: 'ok' }
})
// register end;


// launching server
server.listen({
    port: process.env.PORT, 
    host: '127.0.0.1'
})

console.log("\x1b[32m%s\x1b[0m", "Server running on localhost:3000");

// Create admin and temp users if they don't exist
await initializeTempData();
