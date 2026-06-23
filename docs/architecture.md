# Project Matchmaker architecture

The web service owns persistence and authorization. The real-time service only authenticates short-lived workspace tickets, manages Socket.IO rooms, and broadcasts already-persisted events.

## Services

- `apps/web`: Next.js App Router, GitHub OAuth, MongoDB repositories, APIs, and UI.
- `apps/realtime`: standalone Node + Socket.IO service for private project-workspace rooms.
- `packages/shared`: domain entities, Zod validation schemas, and typed real-time events.

## Message delivery

1. The chat client posts a message to `POST /api/messages`.
2. The web app checks workspace membership and writes it to MongoDB.
3. The client emits the returned message to Socket.IO.
4. Socket.IO verifies the ticket identity and project match, then broadcasts to the project room.

The Socket.IO service never accepts raw message content for persistence and cannot grant workspace access.
