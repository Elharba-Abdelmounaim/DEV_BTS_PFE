# 🎓 DevEduHub

DevEduHub is a comprehensive learning management system (LMS) designed for software engineering students and teachers. It features automated grading via Docker, course management, and real-time notifications.

## 🚀 Quick Start (For a New Machine)

If you have just cloned this project on a new computer, run the following command to set everything up automatically:

```bash
make setup
```

This will:
1. Create your `.env` configuration.
2. Start all Docker containers (Database, Redis, API, Frontend, Grader).
3. Install all PHP dependencies.
4. Initialize the database with migrations and demo data.

---

## 🛠️ Manual Setup

If you don't want to use the setup script, follow these steps:

1. **Configure Environment:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Start Containers:**
   ```bash
   make up
   ```

3. **Install Dependencies:**
   ```bash
   docker-compose exec -T app composer install
   ```

4. **Initialize Database:**
   ```bash
   make seed
   ```

---

## 🌐 Accessing the App

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Mailpit (Emails):** [http://localhost:8025](http://localhost:8025)

### 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Teacher** | `teacher@deveduhub.com` | `password` |
| **Student 1** | `student1@deveduhub.com` | `password` |

---

## 🛠️ Common Commands

- `make up`: Start the project.
- `make down`: Stop the project.
- `make seed`: Reset and re-seed the database.
- `make logs`: View application logs.
- `make test`: Run backend tests.
