<p align="center">
  <img src="src/frontend/public/logo.png" alt="Galactik Pingpong Logo" width="200"/>
</p>

<h1 align="center">Galactik Pingpong</h1>

<p align="center">
  <strong>A Full-Stack Multiplayer 3D Pong Gaming Platform with Blockchain Integration</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Babylon.js-BB464B?style=for-the-badge&logo=babylon.js&logoColor=white" alt="Babylon.js"/>
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify"/>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [DevOps & Infrastructure](#devops--infrastructure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Smart Contracts](#smart-contracts)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Team](#team)

---

## Overview

**Galactik Pingpong** is a modern multiplayer 3D Pong gaming platform that combines classic arcade gameplay with cutting-edge blockchain technology. Players can compete in real-time matches, participate in tournaments with cryptocurrency prize pools, chat with friends, and earn achievements.

### Key Highlights

- **3D Pong Gameplay** - Immersive gaming experience powered by Babylon.js
- **Blockchain Tournaments** - Compete for TRIZcoin prizes on Avalanche network
- **Real-time Multiplayer** - Play against friends remotely via WebSockets
- **Social Features** - Chat, friends system, and online status tracking
- **Microservices Architecture** - Scalable and maintainable backend design

---

## Features

### Game Modes

| Mode | Description |
|------|-------------|
| **Local Multiplayer** | Two players on the same device |
| **Play vs Bot** | Challenge AI opponents |
| **Remote Play** | Real-time matches with friends online |
| **Tournament Mode** | Blockchain-integrated competitive matches |

### Social Features

- Real-time chat with message history
- Friends system (send/accept/reject requests)
- Online status tracking
- Block/unblock users
- Game invitations via chat
- Tournament notifications

### Blockchain Integration

- **TRIZcoin** - Custom ERC-20 token for tournament entry and prizes
- MetaMask wallet integration
- Transparent prize pool distribution
- Refund mechanism for expired tournaments
- Deployed on Avalanche Fuji testnet

### User System

- Secure registration and login
- GitHub OAuth authentication
- Two-Factor Authentication (TOTP & Email)
- Password reset via email
- Profile customization with avatars
- XP and achievements system
- Match history tracking

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| TypeScript | Type-safe JavaScript |
| Vite 7 | Build tool & dev server |
| Babylon.js | 3D game engine |
| Tailwind CSS 4 | Styling |
| Socket.IO Client | Real-time communication |
| Viem | Blockchain interaction |

### Backend (Microservices)
| Service | Port | Technologies |
|---------|------|--------------|
| **User Service** | 3001 | Fastify, Prisma, SQLite, JWT, Socket.IO, SendGrid |
| **Game Service** | 3500 | Fastify, Socket.IO, RabbitMQ |
| **Chat Service** | 4000 | Fastify, Prisma, SQLite, Socket.IO |
| **Blockchain Service** | - | Fastify, Viem, RabbitMQ |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Solidity 0.8.28 | Smart contracts |
| Hardhat 3 | Development framework |
| OpenZeppelin | Secure contract libraries |
| Avalanche Fuji | Testnet deployment |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker & Docker Compose | Containerization |
| Nginx | Reverse proxy with SSL |
| RabbitMQ | Message broker |
| ELK Stack | Centralized logging |
| Prometheus & Grafana | Monitoring & metrics |
| Alertmanager | Alert notifications |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│                              :443 (SSL)                          │
└─────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │   User Service  │    │   Game Service  │
│   (Vite + TS)   │    │     :3001       │    │     :3500       │
│   Babylon.js    │    │  Fastify/Prisma │    │ Socket.IO/Game  │
└─────────────────┘    └────────┬────────┘    └────────┬────────┘
                                │                      │
                                │    ┌─────────────────┘
                                ▼    ▼
                       ┌─────────────────┐
                       │    RabbitMQ     │
                       │  Message Broker │
                       └────────┬────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Chat Service   │    │   Blockchain    │    │   Avalanche     │
│     :4000       │    │    Service      │    │  Fuji Testnet   │
│ Fastify/Prisma  │    │   Viem/Events   │    │  Smart Contracts│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure

```
Multiplayer-Gaming-Platform/
├── docker-compose.yml          # Main Docker orchestration
├── Makefile                    # Build & run commands
├── .example.env                # Environment template
│
├── infra/
│   ├── nginx/                  # Reverse proxy config
│   ├── elk-stack/              # Elasticsearch, Logstash, Kibana
│   ├── monitoring/             # Prometheus, Grafana, Alertmanager
│   └── rabbitmq/               # Message broker
│
└── src/
    ├── frontend/               # TypeScript + Babylon.js frontend
    │   ├── src/
    │   │   ├── core/           # Router, Component base, state
    │   │   ├── components/     # UI components
    │   │   ├── pages/          # Page views
    │   │   ├── services/       # API services
    │   │   └── web3/           # Blockchain integration
    │   └── public/             # Static assets
    │
    ├── backend/
    │   ├── user-service/       # Auth, profiles, friends
    │   ├── game-service/       # Real-time game logic
    │   ├── chat-service/       # Messaging system
    │   └── blockchain-service/ # Contract interactions
    │
    └── blockchain/             # Solidity smart contracts
        ├── contracts/          # TRIZcoin & TournamentFactory
        ├── scripts/            # Deployment scripts
        └── test/               # Contract tests
```

---

## DevOps & Infrastructure

Our platform implements a complete DevOps pipeline with containerization, centralized logging, monitoring, and alerting.

### Containerization

All services are containerized using Docker and orchestrated with Docker Compose for consistent deployment across environments.

### ELK Stack (Centralized Logging)

Complete logging infrastructure for debugging and monitoring application behavior.

| Component | Port | Purpose |
|-----------|------|---------|
| **Elasticsearch** | 9200 | Log storage and indexing |
| **Logstash** | 5044 | Log processing and parsing |
| **Kibana** | 5601 | Log visualization and dashboards |

**Features:**
- Centralized log aggregation from all microservices
- Custom Kibana dashboards for log analysis
- Full-text search across all logs
- Log retention and lifecycle management

### Prometheus & Grafana (Monitoring)

Real-time metrics collection and visualization for all services.

| Component | Port | Purpose |
|-----------|------|---------|
| **Prometheus** | 9090 | Metrics collection and storage |
| **Grafana** | 3000 | Metrics visualization and dashboards |
| **Alertmanager** | 9093 | Alert routing and notifications |

**Features:**
- Real-time service health monitoring
- Custom dashboards for each microservice
- Resource usage tracking (CPU, memory, network)
- Configurable alert rules

### Prometheus Alerting

Configured alerts for critical system events:

- Service downtime detection
- High memory usage warnings
- API response time thresholds
- Database connection failures

### Nginx Reverse Proxy

Nginx handles SSL termination, load balancing, and routing to backend services.

**Features:**
- SSL/TLS termination (HTTPS)
- WebSocket proxying for real-time features
- Service routing (/api/*, /socket.io/*, /chat-ws/*)
- Static file serving for frontend

### RabbitMQ (Message Broker)

Asynchronous communication between microservices for:
- Match results processing
- Tournament updates
- Real-time notifications

### Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MONITORING STACK                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Prometheus  │───▶│  Grafana    │    │Alertmanager │◀───│   Alerts    │  │
│  │   :9090     │    │   :3000     │    │   :9093     │    │   Rules     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ metrics
┌─────────────────────────────────────────────────────────────────────────────┐
│                               APPLICATION                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Nginx     │───▶│   Frontend  │    │   Backend   │◀──▶│  RabbitMQ   │  │
│  │   :443      │    │   :5173     │    │  Services   │    │   :5672     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ logs
┌─────────────────────────────────────────────────────────────────────────────┐
│                               LOGGING STACK                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │  Logstash   │───▶│Elasticsearch│◀───│   Kibana    │                      │
│  │   :5044     │    │   :9200     │    │   :5601     │                      │
│  └─────────────┘    └─────────────┘    └─────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- MetaMask browser extension (for blockchain features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Multiplayer-Gaming-Platform.git
   cd Multiplayer-Gaming-Platform
   ```

2. **Set up environment variables**
   ```bash
   cp .example.env .env
   # Edit .env with your configuration (see Environment Variables section below)
   ```

3. **Start the application**
   ```bash
   # Full stack with monitoring
   make up

   # Or app only (without DevOps tools)
   make app
   ```

4. **Access the application**
   - Frontend: `https://localhost`
   - Kibana (logs): `http://localhost:5601`
   - Grafana (metrics): `http://localhost:3000`

### Environment Variables

Create a `.env` file from `.example.env` and configure the following:

#### RabbitMQ (Message Broker)
| Variable | Description | Example |
|----------|-------------|---------|
| `RABBITMQ_DEFAULT_USER` | RabbitMQ admin username | `transcendence_admin` |
| `RABBITMQ_DEFAULT_PASS` | RabbitMQ admin password | `your_super_secret_password` |
| `RABBITMQ_URL` | Connection URL for services | `amqps://user:pass@rabbitmq:5671` |

#### Blockchain
| Variable | Description | Example |
|----------|-------------|---------|
| `FUJI_PRIVATE_KEY` | Wallet private key for contract deployment | `0x...` (keep secret!) |
| `FUJI_RPC_URL` | Avalanche Fuji RPC endpoint | `wss://api.avax-test.network/ext/bc/C/ws` |
| `VITE_FUJI_RPC_URL` | Frontend RPC URL | Same as above |
| `VITE_FUJI_CHAIN_ID` | Avalanche Fuji chain ID | `0xa869` |

#### Database
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | User service SQLite path | `file:/app/data/usermgmt.db` |
| `CHAT_DB_URL` | Chat service SQLite path | `file:/app/data/chat.db` |

#### Security (Important!)
| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SEC` | JWT signing secret (min 32 chars) | Random secure string |
| `COOKIE_SECRET` | Cookie signing secret (min 32 chars) | Random secure string |

#### Email (Password Reset & 2FA)
| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username/email | `your-email@gmail.com` |
| `EMAIL_PASS` | SMTP password or app password | Gmail app password |
| `EMAIL_FROM` | Sender email address | `noreply@yourdomain.com` |

#### GitHub OAuth (Optional)
| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | From GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | From GitHub Developer Settings |

#### URLs & Ports
| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend URL for redirects | `https://localhost` |
| `BACKEND_URL` | Internal backend URL | `http://user-service:3001` |
| `PORT` | User service port | `3001` |
| `GAME_PORT` | Game service port | `3500` |
| `CHAT_PORT` | Chat service port | `4000` |

#### Monitoring (Grafana)
| Variable | Description | Example |
|----------|-------------|---------|
| `GF_SECURITY_ADMIN_USER` | Grafana admin username | `admin` |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana admin password | `admin123` |

#### Logging (ELK Stack)
| Variable | Description | Example |
|----------|-------------|---------|
| `ELASTIC_PASSWORD` | Elasticsearch password | `changeme` |
| `ES_JAVA_OPTS` | Elasticsearch JVM memory | `-Xms512m -Xmx512m` |
| `LS_JAVA_OPTS` | Logstash JVM memory | `-Xms512m -Xmx512m` |
| `DOCKER_HOST_IP` | Docker host IP for logging | `172.17.0.1` |

### Available Commands

```bash
# Full stack (with ELK & monitoring)
make up          # Start all services with monitoring
make down        # Stop all services
make restart     # Restart all services
make logs        # Follow logs
make clean       # Stop and remove volumes
make fclean      # Full cleanup (prune docker)
make re          # Full rebuild

# App only (without DevOps tools)
make app         # Start main application only
make app-down    # Stop application
make app-restart # Restart application
make app-logs    # Application logs
make app-clean   # Stop and remove volumes
make app-re      # Full app rebuild

# Help
make help        # Show all available commands
```

---

## Smart Contracts

### TRIZcoin (ERC-20 Token)

Custom token used for tournament entry fees and prize pools.

```solidity
// Token Details
Name: TRIZcoin
Symbol: TRIZ
Decimals: 18
```

### TournamentFactory

Manages tournament lifecycle including creation, joining, match results, and prize distribution.

**Key Functions:**
- `createTournament()` - Create a new tournament with entry fee
- `joinTournament()` - Join an existing tournament
- `submitMatchResult()` - Record match outcomes
- `distributePrizes()` - Distribute prize pool to winners
- `claimRefund()` - Claim refund for expired tournaments

### Deployment

Contracts are deployed on **Avalanche Fuji Testnet**.

```bash
cd src/blockchain
npm install
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/Tournament.ts --network fuji
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/github` | GitHub OAuth |
| POST | `/api/auth/login/verify` | 2FA verification |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/me` | Update profile |

### Friends Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | List friends |
| GET | `/api/friends/online` | Get online friends |
| PUT | `/api/friends/requests/send/:id` | Send friend request |
| PUT | `/api/friends/requests/accept/:id` | Accept request |
| POST | `/api/friends/requests/reject/:id` | Reject request |

### WebSocket Endpoints

| Path | Service | Purpose |
|------|---------|---------|
| `/socket.io/` | Game Service | Real-time gameplay |
| `/chat-ws/` | Chat Service | Messaging |
| `/online-status/` | User Service | Online tracking |

---

## Team

- **oessaadi**
- **laoubaid**
- **ckhater**
- **kez-zoub**
- **oel-moue**

---

## Troubleshooting

### Docker Issues

**Problem: Containers fail to start or keep restarting**
```bash
# Check container logs
docker compose logs <service-name>

# Restart all services
make restart

# Full cleanup and rebuild
make fclean && make up
```

**Problem: Port already in use**
```bash
# Find process using the port
sudo lsof -i :<port>

# Kill the process
sudo kill -9 <PID>

# Or change the port in .env file
```

**Problem: Out of disk space**
```bash
# Clean up Docker resources
docker system prune -af --volumes
```

### Database Issues

**Problem: Database locked or corrupted**
```bash
# Stop services and remove volumes
make clean

# Restart (databases will be recreated)
make up
```

### MetaMask / Blockchain Issues

**Problem: MetaMask not connecting**
- Make sure MetaMask is installed and unlocked
- Check you're on Avalanche Fuji Testnet (Chain ID: 43113)
- Try disconnecting and reconnecting the wallet

**Problem: Transaction failing**
- Ensure you have AVAX for gas fees (get from [Avalanche Faucet](https://faucet.avax.network/))
- Check you have enough TRIZcoin for tournament entry
- Try resetting MetaMask account: Settings > Advanced > Reset Account

**Problem: Wrong network**
```
Add Avalanche Fuji to MetaMask:
- Network Name: Avalanche Fuji Testnet
- RPC URL: https://api.avax-test.network/ext/bc/C/rpc
- Chain ID: 43113
- Symbol: AVAX
- Explorer: https://testnet.snowtrace.io/
```

### Email / 2FA Issues

**Problem: Not receiving emails**
- Check spam/junk folder
- Verify `EMAIL_*` variables in `.env` are correct
- For Gmail: Enable "Less secure apps" or use App Password
- Check email service logs: `docker compose logs user-service`

**Problem: 2FA code not working**
- Ensure device time is synchronized
- Try generating a new code
- If locked out, access database directly to disable 2FA

### WebSocket / Real-time Issues

**Problem: Game not syncing / Chat not working**
```bash
# Check if WebSocket services are running
docker compose ps

# Check nginx WebSocket proxy
docker compose logs nginx

# Verify WebSocket connections in browser DevTools (Network > WS)
```

**Problem: Connection refused errors**
- Check if all services are running: `docker compose ps`
- Verify nginx is routing correctly
- Check for CORS issues in browser console

### ELK Stack Issues

**Problem: Kibana not loading**
```bash
# Check Elasticsearch health
curl -u elastic:changeme http://localhost:9200/_cluster/health

# Check ELK logs
docker compose -f infra/elk-stack/docker-compose.yml logs
```

**Problem: No logs appearing in Kibana**
- Wait 2-3 minutes for initial indexing
- Check Logstash is receiving logs: `docker compose logs logstash`
- Verify `DOCKER_HOST_IP` in `.env` is correct

### Grafana / Prometheus Issues

**Problem: No metrics in Grafana**
```bash
# Check Prometheus targets
curl http://localhost:9090/targets

# Check if services expose metrics
docker compose logs prometheus
```

**Problem: Can't login to Grafana**
- Default credentials: `admin` / `admin123`
- Or check `GF_SECURITY_ADMIN_*` in `.env`

### General Tips

1. **Always check logs first:**
   ```bash
   make logs           # All services
   docker compose logs <service>  # Specific service
   ```

2. **Restart fixes most issues:**
   ```bash
   make restart
   ```

3. **Nuclear option (full reset):**
   ```bash
   make fclean && make up
   ```

4. **Check service health:**
   ```bash
   docker compose ps
   ```

---

## License

This project was created as part of the 42 School curriculum.

---

<p align="center">
  <img src="src/frontend/public/logo.png" alt="Galactik Pingpong" width="80"/>
  <br/>
  <strong>Galactik Pingpong</strong> - Play. Compete. Win.
</p>
