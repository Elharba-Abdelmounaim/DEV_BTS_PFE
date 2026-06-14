# DevEduHub — Developer Guide

## Quick start (Docker)

```bash
git clone https://github.com/your-org/deveduhub.git
cd deveduhub

cp .env.example .env
# Fill in APP_KEY, DB_PASSWORD

make up       # starts all 8 services
make seed     # migrate + seed demo data
make health   # verify Laravel + grader are responding
```

Access:
- Frontend:  http://localhost:3000
- Laravel API: http://localhost:8080
- Grader API:  http://localhost:8000
- Mailpit:     http://localhost:8025

Demo credentials: `teacher@deveduhub.com` / `password`  ·  `student1@deveduhub.com` / `password`

---

## Running tests locally

```bash
# Laravel (PHP)
php artisan test --parallel

# Python grader
cd grader && pytest test_grader.py -v

# Frontend TypeScript check
cd frontend && npx tsc --noEmit
```

---

## CI/CD overview

### Workflows

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | Pull request / push to main | Laravel tests, Python tests, Docker build, TypeScript check |
| `deploy.yml` | Tag push (`v*` or `release/*`) | Build & push images to GHCR, deploy to staging, deploy to production |
| `security.yml` | Every Monday 06:00 UTC | `composer audit`, `npm audit`, `pip-audit` |

### Branch strategy

```
main        ← stable, protected. CI runs on every push.
develop     ← integration branch. PR required to merge.
feature/*   ← short-lived feature branches.
hotfix/*    ← urgent fixes branched from main.
```

### Release process

```bash
# 1. Create a version tag → triggers deploy to STAGING automatically
git tag v1.2.0
git push origin v1.2.0

# 2. After staging validation, create a release tag → requires GitHub approval → deploys to PRODUCTION
git tag release/v1.2.0
git push origin release/v1.2.0
```

### Required GitHub secrets

| Secret | Used in |
|---|---|
| `STAGING_HOST` | `deploy.yml` — SSH host for staging server |
| `STAGING_USER` | `deploy.yml` — SSH username |
| `STAGING_SSH_KEY` | `deploy.yml` — SSH private key |
| `PROD_HOST` | `deploy.yml` — production server host |
| `PROD_USER` | `deploy.yml` — SSH username |
| `PROD_SSH_KEY` | `deploy.yml` — SSH private key |
| `MAINTENANCE_SECRET` | `deploy.yml` — bypass URL for maintenance mode |

`GITHUB_TOKEN` is automatically provided by GitHub Actions.

---

## Docker services

| Service | Port | Description |
|---|---|---|
| `nginx` | 8080 | Laravel reverse proxy |
| `app` | — | PHP-FPM (Laravel) |
| `db` | 5432 | PostgreSQL 15 |
| `redis` | 6379 | Queue + cache |
| `grader` | 8000 | Python FastAPI auto-grader |
| `worker` | — | Queue worker: grading (timeout=180s) |
| `notifier` | — | Queue worker: notifications (timeout=30s) |
| `scheduler` | — | `php artisan schedule:run` every 60s |
| `frontend` | 3000 | React SPA (dev: Vite, prod: nginx) |
| `mailpit` | 8025 | Email catcher (dev only) |

---

## Make commands

```bash
make up              # start full stack
make down            # stop all services
make build           # rebuild all images (no cache)
make seed            # migrate:fresh --seed
make test            # php artisan test --parallel
make test-python     # pytest test_grader.py -v
make logs            # follow app + worker + grader logs
make shell           # bash into app container
make shell-db        # psql into database
make health          # curl /api/health + /health
make failed-jobs     # list failed queue jobs
make retry-failed    # retry all failed jobs
```
