import jwt from 'jsonwebtoken'

// token verifying function
async function verifyToken(request, reply) {
    try {
        const authToken = request.cookies?.authToken

        if (!authToken) {
            return reply.code(401).send({ 
                error: 'Authentication required',
                message: 'No token provided'
            })
        }

        const decoded = jwt.verify(authToken, process.env.JWT_SEC)
        
        request.user = decoded
        
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return reply.code(401).send({ 
                error: 'Invalid token',
                message: 'Token is malformed or invalid'
            })
        }
        
        if (err.name === 'TokenExpiredError') {
            return reply.code(401).send({ 
                error: 'Token expired',
                message: 'Please login again'
            })
        }
        
        // default error
        return reply.code(500).send({ 
            error: 'Authentication error',
            message: 'An error occurred during authentication'
        })
    }
}

export { verifyToken }
