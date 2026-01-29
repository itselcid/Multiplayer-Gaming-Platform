
FROM rabbitmq:3-management

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/rabbitmq/certs

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/rabbitmq/certs/server.key \
    -out /etc/rabbitmq/certs/server.pem \
    -subj "/CN=localhost" && \
    cp /etc/rabbitmq/certs/server.pem /etc/rabbitmq/certs/ca.pem

COPY /infra/rabbitmq/rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

RUN chown -R rabbitmq:rabbitmq /etc/rabbitmq/certs \
    && chown rabbitmq:rabbitmq /etc/rabbitmq/rabbitmq.conf \
    && chmod 600 /etc/rabbitmq/certs/server.key

EXPOSE 5671

CMD ["rabbitmq-server"]