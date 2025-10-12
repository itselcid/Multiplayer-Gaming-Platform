# ft_transcendence / Pong Contest Web

## 🎯 Project Overview

ft_transcendence is a real-time multiplayer Pong web application.  
Players can compete locally or remotely, enter tournaments, and optionally face AI opponents.  
Beyond the mandatory version, optional modules allow advanced features like authentication, blockchain scoring, microservices, live chat, monitoring, etc.  

This project was developed to satisfy the requirements set forth in the 42 subject “ft_transcendence”. :contentReference[oaicite:1]{index=1}

---

## 🚀 Project Structure (exemplary)



```text
ft_transcendence/
├── apps/
│   ├── backend/                   # chosen backend (or framework) code
│   │   ├── src/
│   │   │   ├── Controllers/
│   │   │   ├── Models/
│   │   │   ├── Services/
│   │   │   ├── Middlewares/
│   │   │   └── …  
│   │   ├── public/                 # public entry (e.g. index.php, static assets if any)
│   │   ├── config/                 # configuration (e.g. env, routing, DB)
│   │   ├── tests/                  # backend unit / integration tests
│   │   └── Dockerfile / docker/    # Docker build for backend
│   └── frontend/                  # SPA frontend (TypeScript)
│       ├── src/
│       │   ├── components/
│       │   ├── views/
│       │   ├── services/          # API calls, WebSocket wrapper
│       │   ├── stores / state/
│       │   ├── assets/            # images, styles, etc.
│       │   └── index.tsx / main.ts
│       ├── public/                # index.html, favicon, etc.
│       ├── tests/                 # frontend tests
│       └── build / webpack / config
├── infra/                          # infrastructure / devops / deployment
│   ├── docker-compose.yml
│   ├── nginx/                      # reverse proxy, TLS, config
│   ├── traefik/ / other proxy config
│   ├── monitoring/ (optional)      # Prometheus, Grafana, ELK, etc.
│   └── scripts/                     # helper scripts (e.g. start, stop, migrations)
├── docs/                           # design docs, APIs, module choices, diagrams
│   ├── architecture.md
│   ├── module_selection.md
│   └── api_spec.md
├── shared/                         # code shared between backend & frontend (e.g. types, DTOs)
│   ├── types/                       # TypeScript types or shared data types
│   └── utils/                       # shared utilities
├── .env.example
├── .gitignore
├── README.md
└── Makefile / task runner (optional)
```


- `apps/backend/` – backend (PHP or chosen backend stack)  
- `apps/frontend/` – SPA frontend  
- `infra/` – Docker, deployment, reverse proxy  
- `shared/` – shared types and utilities  
- `docs/` – architecture, API, module design  
- `scripts/`, `Makefile` – helper commands  
- `.env.example` – environment variables template  

---

## ✅ Features & Modules

### Mandatory Requirements

- SPA website with forward/back browser navigation  
- Real-time Pong game (2 players)  
- Tournament system with matchmaking  
- Alias entry (no user accounts)  
- Secure handling of inputs, no unhandled warnings  
- Docker-based deployment (single command)  
- HTTPS / WSS for secure communications  
- Protection against XSS, SQLi, input validation, password hashing (if applicable)  
  :contentReference[oaicite:2]{index=2}  

### Optional Modules Implemented

- **Web – Backend Framework (Fastify + Node.js)**  
- **Frontend – Tailwind CSS**  
- **User Management (authentication, user profiles)**  
- **Remote Players**  
- **AI Opponent**  
- **Live Chat**  
- **DevOps – Monitoring (Prometheus / Grafana)**  

---

## 🛠️ Getting Started & Setup

### Prerequisites

- Docker & Docker Compose  
- (Optional) Node.js, npm/yarn — depending on how you build frontend  
- (Optional) Composer / PHP CLI — depending on backend choice  

### Installation & Launch

1. Copy `.env.example` to `.env` and fill in required values (e.g. database URL, TLS certs)  
2. Build and launch containers:

   ```bash
   docker-compose up --build

