
import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export default function swaggerPlugin(server: FastifyInstance) {
    server.register(swagger, {
        mode: 'static',
        specification: {
            path: './openapi.yaml',
            baseDir: process.cwd(),
        }
    });

    server.register(swaggerUI, {
        routePrefix: '/docs',
    });
}

