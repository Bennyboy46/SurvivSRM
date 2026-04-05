# SurvivSRM

SurvivSRM is a chat-first academic companion for SRMIST students.
It helps you quickly check attendance, marks, timetable, and calendar/day-order details in one place.

## Features

- Secure login flow with signed httpOnly session cookies
- Timetable view with day-order mapping
- Attendance and marks context in chat replies
- Calendar-aware /get support for day order, holidays, and events
- Groq-powered assistant responses
- Privacy-focused API design (minimal client-side exposure)

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Backend: Go (Fiber)
- AI: Groq
- Auth/Security: Signed cookies, hardened API headers

## Project Structure

```text
	backend/   # Go scraper/API
	chatbot/   # Next.js app
```

## Local Setup

### Prerequisites

- Node.js 20+
- Go 1.23+
- npm

### 1. Clone

```bash
git clone https://github.com/Bennyboy46/SurvivSRM.git
cd SurvivSRM
```

### 2. Configure Environment

Create chatbot/.env.local:

```env
GOSCRAPER_URL=http://localhost:8080
COOKIE_SECRET=your_random_cookie_secret
GROQ_API_KEY=your_groq_api_key
```

### 3. Install Dependencies

```bash
cd chatbot
npm install
cd ../backend
go mod tidy
```

### 4. Run Backend

```bash
cd backend
go run src/main.go
```

Backend runs at http://localhost:8080.

### 5. Run Chatbot

```bash
cd chatbot
npm run dev
```

Chatbot runs at http://localhost:3000.

## Build

### Chatbot

```bash
cd chatbot
npm run build
npm run start
```

### Backend

```bash
cd backend
go build -o bin/main src/main.go
```

Run:

- Windows: backend/bin/main.exe
- Linux/macOS: backend/bin/main

## Chatbot API Routes

- POST /api/auth/session
- POST /api/q

## Security Notes

- Signed, httpOnly session cookies
- API security headers enabled
- No-store response policy for sensitive paths
- Server-side environment validation before build

## Deployment (Free-Friendly)

- Deploy chatbot on Vercel
- Deploy backend on a free Go host
- Set production env vars:
	- GOSCRAPER_URL
	- COOKIE_SECRET
	- GROQ_API_KEY

## License

MIT
