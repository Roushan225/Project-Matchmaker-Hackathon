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

## Local and Vercel configuration

Use a separate GitHub OAuth app for each web deployment. GitHub allows one callback URL per OAuth app:

- Local app: `http://localhost:3000/api/auth/callback/github`
- Vercel app: `https://<your-vercel-domain>/api/auth/callback/github`

Set the corresponding `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in each runtime: `apps/web/.env.local` for local development and the Vercel project environment variables for the deployed web app. Vercel does not load `apps/web/.env.Vercel` automatically.

Use the same `MONGODB_URI` only when local and production should share application data. Set a distinct `AUTH_SECRET` per environment. The web app and its corresponding Socket.IO service must share the same `SOCKET_TOKEN_SECRET`. If one Socket.IO deployment serves both web origins, set its `WEB_ORIGIN` to a comma-separated allowlist, for example `http://localhost:3000,https://<your-vercel-domain>`.

## Workspace layout

- `apps/web`: Next.js UI, Auth.js, route handlers, and MongoDB domain logic.
- `apps/realtime`: Socket.IO service, deployed as a persistent Node process.
- `packages/shared`: domain types, validation schemas, and socket contracts.

Deploy both applications to Node-capable infrastructure. The Socket.IO service needs a host that supports persistent WebSocket connections; do not deploy it to a serverless-only platform.
