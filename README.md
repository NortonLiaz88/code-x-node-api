# CodeX API

CodeX is a mobile learning environment that helps autistic university students learn programming, with short lessons, a study schedule, a customizable interface and an LLM tutor. It was presented at SBIE 2024: [CodeX: ambiente virtual de aprendizagem em programação, integrado à LLM, para auxiliar estudantes com TEA](https://doi.org/10.5753/sbie.2024.242533).

This repository is the core API. CodeX has three repositories:

| Repository | What it is |
| --- | --- |
| [code-x](https://github.com/NortonLiaz88/code-x) | React Native app (Android and iOS) |
| [code-x-node-api](https://github.com/NortonLiaz88/code-x-node-api) | This NestJS API: auth, profile, courses, lessons, schedule, store, chat |
| [code-x-ai](https://github.com/NortonLiaz88/code-x-ai) | FastAPI tutor service that talks to the language model |

## How the pieces connect

```
app ──HTTP──▶ API ──HTTP──▶ tutor ──▶ LLM (Groq today, Ollama locally for the MVP)
               │               │
               ├── PostgreSQL  └── MongoDB (tutor sessions, db "codex")
               ├── MongoDB (lesson templates, db "db")
               └── MinIO (APK download and media)
```

- **PostgreSQL** (Prisma): users, profiles, preferences, courses, activities, progress, schedules, store items and purchases.
- **MongoDB**: lesson templates, one collection per language (`python`, `java`, ...) in the `db` database. On startup and every 12 hours the API copies new templates into the Postgres `Activity` table. The tutor keeps chat sessions in the `codex` database.
- **MinIO**: the APK served at `GET /app`, and media.
- **Tutor**: the API forwards chat messages to `POST {TUTOR_URL}/response` and gets back `{ messages: [{ answer, tooltip }] }`, where `tooltip` holds the quick replies.

Swagger docs are at `http://localhost:8000/docs` once the API is running.

## Run the whole stack locally

You need Docker with Compose. Ollama uses the NVIDIA GPU through the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html); on a machine without one, delete the `deploy` block of the `ollama` service.

```bash
git clone https://github.com/NortonLiaz88/code-x-node-api.git
git clone https://github.com/NortonLiaz88/code-x-ai.git   # next to the API

cd code-x-ai && cp .env.example .env    # set API_KEY (Groq)
cd ../code-x-node-api && cp .env.example .env   # set the secrets below

docker compose up --build
```

The API container applies migrations and runs the seed before starting, so the first start takes a while. When it logs `Nest application successfully started`, the stack is ready:

| Service | URL (localhost only) |
| --- | --- |
| API | http://localhost:8000 (Swagger at `/docs`) |
| Tutor | http://localhost:8001 |
| PostgreSQL | `localhost:5432`, user, password and database `codex` |
| MongoDB | `localhost:27017` |
| MinIO | API `localhost:9000`, console http://localhost:9001 |
| Ollama | http://localhost:11434 |

Log in with `student@codex.local` or `admin@codex.local`, password `codex123` (or `SEED_PASSWORD`). Point the app's `API_URL` at `http://<your machine's LAN IP>:8000` to use it from a phone.

To pull a model into Ollama: `docker compose exec ollama ollama pull <model>`.

To start from scratch, `docker compose down -v` removes the data volumes.

### Seed data

`yarn seed` (run automatically by compose) is safe to run again. It creates:

- one course per language and level (Python beginner is course 1, which sign-up enrols new users in),
- the store items,
- a demo student and a demo admin with profile, progress, schedule and preferences,
- a few Python beginner lessons in MongoDB.

To make an existing user an admin: `yarn admin:grant someone@example.com`, then log in again.

## Environment variables

Copy `.env.example` to `.env`. Inside compose, the database, Mongo, MinIO and tutor addresses are overridden with the service names, so only the secrets need filling in.

| Variable | Used for |
| --- | --- |
| `PORT` | Port the API listens on (default 8000) |
| `JWT_SECRET_KEY` | Signs access tokens. Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET_KEY` | Signs refresh tokens. Must differ from `JWT_SECRET_KEY`; the API refuses to start otherwise |
| `DATABASE_URL` | PostgreSQL connection string |
| `MONGO_URL` | MongoDB connection string |
| `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL` | MinIO address |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | MinIO credentials (compose also uses them as the MinIO root user) |
| `MINIO_BUCKET` | Bucket name (compose creates it) |
| `TUTOR_URL` | Base URL of the tutor service, without a trailing slash |
| `SEED_PASSWORD` | Optional password for the seeded demo users |
| `TUTOR_PATH` | Optional, compose only: path to the code-x-ai checkout (default `../code-x-ai`) |

## Develop without Docker for the API

Run only the dependencies in Docker and the API on your machine (Node 22):

```bash
docker compose up -d postgres mongo minio tutor
yarn install
npx prisma migrate deploy
yarn seed
yarn start:dev
```

## Tests and checks

```bash
yarn lint:check   # eslint + prettier, no fixes
yarn build
yarn test         # unit tests
```

CI runs the same steps on every pull request (`.github/workflows/ci.yml`).

## Database changes

Edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <change>` with the stack running, and commit the generated folder under `prisma/migrations`.
