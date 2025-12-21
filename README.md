# Pointer - Agile Story Pointing App

A full-stack application for pointing agile stories using a distributed voting system. Built with Angular frontend and Spring Boot backend.

## Features

- Create pointing sessions with story names
- Up to 15 participants can join a session
- Creator can start a voting timer
- Participants vote using Fibonacci sequence (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89)
- Votes are hidden from other participants during voting
- Timer-based voting (60 seconds default)
- Real-time session updates via polling

## Project Structure

```
Pointer/
├── backend/          # Spring Boot backend
└── frontend/         # Angular frontend
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- Angular CLI 17+

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build and run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:4200`

## Usage

1. **Create a Session:**
   - Enter a story name and your name
   - Click "Create Session"
   - Share the Session ID with your team

2. **Join a Session:**
   - Enter the Session ID and your name
   - Click "Join Session"

3. **Start Voting:**
   - The creator clicks "Start Voting" when ready
   - A 60-second timer begins

4. **Vote:**
   - Select your points from the Fibonacci sequence
   - Click "Submit Vote"
   - You can change your vote until the timer expires

5. **View Results:**
   - After the timer expires, all votes are displayed
   - Each participant can see their own vote highlighted

## Workflow

```mermaid
flowchart TD
  Home[Home page] -->|Create| CreateSession[POST /api/sessions]
  Home -->|Join| JoinSession[POST /api/sessions/{id}/join]
  Home -->|Open history item| LoadSession[GET /api/sessions/{id}?participantName=you]

  CreateSession --> SessionView[Session view]
  JoinSession --> SessionView
  LoadSession --> SessionView

  SessionView -->|Creator starts| StartVoting[POST /api/sessions/{id}/start]
  StartVoting --> Voting[Voting timer running]
  SessionView -->|Submit vote| SubmitVote[POST /api/sessions/{id}/vote]
  Voting -->|Poll 2s| Refresh[GET /api/sessions/{id} & /votes]
  Voting -->|Timer ends| Results[Show all votes]

  Results -->|Creator new story| NewStory[POST /api/sessions/{id}/story]
  NewStory --> SessionView

  SessionView -->|Leave| Leave[POST /api/sessions/{id}/leave]
  Leave --> Home

  CreatorLeave[Creator leaves session] -->|Session deleted| AllRedirect[Clients redirected home]
  Nightly[Midnight cleanup] --> Purge[Delete sessions created before today]
```

## API Endpoints

- `POST /api/sessions` - Create a new session
- `POST /api/sessions/{sessionId}/join` - Join a session
- `POST /api/sessions/{sessionId}/start` - Start voting (creator only)
- `POST /api/sessions/{sessionId}/vote` - Submit a vote
- `GET /api/sessions/{sessionId}` - Get session details
- `GET /api/sessions/{sessionId}/votes` - Get votes (own vote visible)

## Technology Stack

**Backend:**
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database
- Java 17

**Frontend:**
- Angular 17
- TypeScript
- RxJS

## Database

The application uses H2 in-memory database. Data is persisted during the application runtime. Access the H2 console at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:pointerdb`).

