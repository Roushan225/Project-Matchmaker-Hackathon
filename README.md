# Project Matchmaker

Project Matchmaker helps developers find credible teammates through GitHub-backed profiles, purposeful project matching, and private team workspaces.

## Local development

Copy the environment template and configure MongoDB Atlas and a GitHub OAuth application:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Start the real-time service in a second terminal:

```bash
npm run dev:realtime
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run typecheck`, `npm run lint`, and `npm run build` before deployment.

## Workspace layout

- `apps/web`: Next.js UI, Auth.js, route handlers, and MongoDB domain logic.
- `apps/realtime`: Socket.IO service, deployed as a persistent Node process.
- `packages/shared`: domain types, validation schemas, and socket contracts.

Deploy both applications to Node-capable infrastructure. The Socket.IO service needs a host that supports persistent WebSocket connections; do not deploy it to a serverless-only platform.
