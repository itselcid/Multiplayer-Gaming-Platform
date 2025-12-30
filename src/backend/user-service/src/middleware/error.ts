
import { FastifyRequest, FastifyReply } from 'fastify';

export const globalErrorHandler = (
    error: any,
    _request: FastifyRequest,
    reply: FastifyReply
) => {
    const statusCode = error.statusCode || 500;
    const message = statusCode < 500 ? error.message : 'Internal Server Error';

    reply.status(statusCode).send({
        error: message
    });
};