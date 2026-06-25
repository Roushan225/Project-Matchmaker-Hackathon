# Project Matchmaker

Project Matchmaker is an AI-powered collaboration platform for hackathon teams, builders, and project owners. It helps users discover developers, create projects, send invitations, manage project workspaces, collaborate in real time, and track project completion.

The app is built as a monorepo with a Next.js web application, a Socket.IO realtime service, and shared TypeScript packages.

## Features

### Authentication and profiles

- GitHub OAuth login using Auth.js.
- User onboarding and editable developer profile.
- GitHub profile sync, including repositories, commits, and contribution graph data.
- Developer status management, such as available or engaged.
- Completed projects reflected on member profiles after project completion.

### Project discovery and matching

- Create and manage projects with name, aim, skills, status, and members.
- Browse/discover projects and developers.
- Apply to join projects.
- Send project invitations to developers.
- Invitation and application tabs backed by database refresh.
- Project owner status flow: recruiting, active, completed, archived.
- Completion confirmation flow with member feedback collection.

### Workspace collaboration

- Dedicated project workspace.
- Team chat powered by Socket.IO.
- Discussion board backed by database messages.
- Resource board with drag-and-drop uploads using React Dropzone and Cloudinary.
- Expense tracker.
- Project-level AI Assist tab.

### AI and search

- Personal dashboard copilot for searching projects and developers.
- Project AI Assist powered by Hugging Face Inference Providers.
- Project AI Assist uses project context and shared conversation memory.
- Per-user private copilot chat memory.

### Realtime notifications

- Smart realtime notifications for invitations, join requests, application decisions, project completion, and other collaboration events.
- Socket.IO notification delivery with database-backed state.

### User experience

- Responsive dashboard layout.
- Copilot-style side panel.
- Skeleton loading states during login and tab transitions.
- Full-screen workspace boards for chat, resources, expenses, and AI Assist.

## Tech stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Auth.js with GitHub OAuth
- MongoDB Atlas
- Socket.IO
- Cloudinary
- Hugging Face Inference Providers
- Vercel for the web app
- Railway for the realtime service

## Monorepo structure

```txt
.
├── apps
│   ├── web          # Next.js application
│   └── realtime     # Socket.IO realtime server
├── packages
│   └── shared       # Shared events, schemas, and TypeScript types
├── package.json     # Root workspace scripts
└── .env.example     # Example environment variables
```

## Prerequisites

- Node.js `>=20.9.0`
- npm
- MongoDB Atlas database
- GitHub OAuth App
- Cloudinary account for resource uploads
- Hugging Face token for AI features
- Vercel account for web deployment
- Railway account for realtime deployment

## Installation

Clone the repository and install dependencies:

```bash
git clone <your-repository-url>
cd next_ts_hackathon
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then fill in the required values described below.

## Environment variables

Never commit real secrets to Git. Use `.env.local` locally and configure production values directly in Vercel and Railway.

### Local `.env.local` example

```env
# MongoDB Atlas
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/project-matchmaker?retryWrites=true&w=majority"

# Auth.js
AUTH_SECRET="replace-with-a-long-random-secret"

# GitHub OAuth
AUTH_GITHUB_ID="<github-oauth-client-id>"
AUTH_GITHUB_SECRET="<github-oauth-client-secret>"

# Socket.IO ticket signing
SOCKET_TOKEN_SECRET="replace-with-a-different-long-random-secret"

# Web app -> realtime service
NEXT_PUBLIC_REALTIME_URL="http://localhost:4000"
REALTIME_SERVER_URL="http://localhost:4000"

# Realtime service
REALTIME_PORT="4000"
WEB_ORIGIN="http://localhost:3000"

# Cloudinary uploads
CLOUDINARY_CLOUD_NAME="<cloudinary-cloud-name>"
CLOUDINARY_API_KEY="<cloudinary-api-key>"
CLOUDINARY_API_SECRET="<cloudinary-api-secret>"

# Hugging Face AI
HF_TOKEN="<hugging-face-token>"
HF_MODEL="meta-llama/Meta-Llama-3-8B-Instruct:fastest"
```

### Required variables

| Variable | Used by | Description |
| --- | --- | --- |
| `MONGODB_URI` | Web | MongoDB Atlas connection string. |
| `AUTH_SECRET` | Web | Secret used by Auth.js. Generate a strong random value. |
| `AUTH_GITHUB_ID` | Web | GitHub OAuth client ID. |
| `AUTH_GITHUB_SECRET` | Web | GitHub OAuth client secret. |
| `SOCKET_TOKEN_SECRET` | Web + Realtime | Shared secret used to sign and verify Socket.IO connection tickets. Must match in both services. |
| `NEXT_PUBLIC_REALTIME_URL` | Web browser | Public realtime server URL. Must be reachable from the browser. |
| `REALTIME_SERVER_URL` | Web server | Optional server-to-server realtime URL. If omitted, the app can fall back to `NEXT_PUBLIC_REALTIME_URL`. |
| `REALTIME_PORT` | Realtime | Local realtime port. Railway usually provides `PORT` automatically. |
| `WEB_ORIGIN` | Realtime | Comma-separated allowed web origins for Socket.IO CORS. |
| `CLOUDINARY_CLOUD_NAME` | Web | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Web | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Web | Cloudinary API secret. Keep server-side only. |
| `HF_TOKEN` | Web | Hugging Face token for AI Assist and copilot responses. |
| `HF_MODEL` | Web | Hugging Face model identifier. |

## GitHub OAuth setup

Create separate GitHub OAuth Apps for local development and production.

### Local OAuth app

```txt
Homepage URL:
http://localhost:3000

Authorization callback URL:
http://localhost:3000/api/auth/callback/github
```

### Production OAuth app

```txt
Homepage URL:
https://<your-vercel-domain>

Authorization callback URL:
https://<your-vercel-domain>/api/auth/callback/github
```

Use the local OAuth client ID/secret in local `.env.local`, and use the production OAuth client ID/secret in Vercel.

If GitHub shows `The redirect_uri is not associated with this application`, the OAuth app being used by the deployed site does not match the callback URL configured in GitHub. Check the Vercel environment variables and redeploy after changing them.

## Local development

Run the web app and realtime server in separate terminals.

Terminal 1:

```bash
npm run dev:web
```

Terminal 2:

```bash
npm run dev:realtime
```

Open the web app:

```txt
http://localhost:3000
```

The realtime service should run at:

```txt
http://localhost:4000
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Build shared package and start the web app. |
| `npm run dev:web` | Start the Next.js web app. |
| `npm run dev:realtime` | Start the Socket.IO realtime service. |
| `npm run build` | Build all workspaces. |
| `npm run lint` | Run lint checks. |
| `npm run typecheck` | Run TypeScript checks. |
| `npm run test` | Run tests. |

## Deployment

The production app uses two deployments:

1. Web app on Vercel.
2. Realtime Socket.IO service on Railway.

Both services must share the same `SOCKET_TOKEN_SECRET`.

### Deploy the web app to Vercel

1. Import the repository into Vercel.
2. Configure the project as the Next.js web app from `apps/web`.
3. Use the repository workspace scripts during build:

```bash
npm run build --workspace=@project-matchmaker/web
```

If Vercel asks for a root directory, select `apps/web`. If your deployment cannot resolve the shared workspace package, keep the project at the repository root and use the workspace build command above.

4. Add all required web environment variables in Vercel.
5. Set the production GitHub OAuth credentials in Vercel.
6. Set the realtime URL:

```env
NEXT_PUBLIC_REALTIME_URL="https://<your-railway-realtime-domain>"
REALTIME_SERVER_URL="https://<your-railway-realtime-domain>"
```

7. Redeploy the Vercel project after changing environment variables.

Recommended production web environment:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/project-matchmaker?retryWrites=true&w=majority"
AUTH_SECRET="<production-auth-secret>"
AUTH_GITHUB_ID="<production-github-oauth-client-id>"
AUTH_GITHUB_SECRET="<production-github-oauth-client-secret>"
SOCKET_TOKEN_SECRET="<same-secret-as-railway>"
NEXT_PUBLIC_REALTIME_URL="https://<your-railway-realtime-domain>"
REALTIME_SERVER_URL="https://<your-railway-realtime-domain>"
CLOUDINARY_CLOUD_NAME="<cloudinary-cloud-name>"
CLOUDINARY_API_KEY="<cloudinary-api-key>"
CLOUDINARY_API_SECRET="<cloudinary-api-secret>"
HF_TOKEN="<hugging-face-token>"
HF_MODEL="meta-llama/Meta-Llama-3-8B-Instruct:fastest"
```

### Deploy the realtime service to Railway

1. Create a new Railway service from the same repository.
2. Prefer using the repository root so Railway can install npm workspace dependencies correctly.
3. Set the build command:

```bash
npm run build --workspace=@project-matchmaker/shared && npm run build --workspace=@project-matchmaker/realtime
```

4. Set the start command:

```bash
npm run start --workspace=@project-matchmaker/realtime
```

5. Configure Railway environment variables:

```env
SOCKET_TOKEN_SECRET="<same-secret-as-vercel>"
WEB_ORIGIN="http://localhost:3000,https://<your-vercel-domain>"
```

Railway provides `PORT` automatically. Keep `REALTIME_PORT` mainly for local development.

6. Deploy the realtime service.
7. Copy the Railway public domain.
8. Add that domain to the Vercel web app as `NEXT_PUBLIC_REALTIME_URL` and `REALTIME_SERVER_URL`.
9. Redeploy the Vercel web app.

If one Railway realtime service must support both local and production web clients, use comma-separated origins:

```env
WEB_ORIGIN="http://localhost:3000,https://<your-vercel-domain>"
```

## Cloudinary setup

Cloudinary is used by the resource board for drag-and-drop file uploads.

Find these values in the Cloudinary dashboard:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If uploads return `500`, verify that all three Cloudinary values are present in the web app environment and redeploy after changing them.

## Hugging Face setup

Hugging Face is used for:

- Dashboard copilot search responses.
- Project AI Assist responses.

Set:

```env
HF_TOKEN="<hugging-face-token>"
HF_MODEL="meta-llama/Meta-Llama-3-8B-Instruct:fastest"
```

If `/api/ai-assist` returns `503` in production, verify that `HF_TOKEN` exists in Vercel and redeploy the web app.

## Production checklist

Before sharing the deployed URL:

- Confirm Vercel uses the production GitHub OAuth app.
- Confirm the GitHub OAuth callback URL exactly matches `https://<your-vercel-domain>/api/auth/callback/github`.
- Confirm MongoDB Atlas allows connections from the deployment.
- Confirm Cloudinary variables are configured in Vercel.
- Confirm Hugging Face variables are configured in Vercel.
- Confirm Railway realtime service is deployed and publicly reachable.
- Confirm `NEXT_PUBLIC_REALTIME_URL` points to the Railway public URL.
- Confirm `WEB_ORIGIN` on Railway includes the Vercel domain.
- Confirm `SOCKET_TOKEN_SECRET` is identical in Vercel and Railway.
- Redeploy both Vercel and Railway after changing shared realtime or environment configuration.

## Troubleshooting

### GitHub login fails on Vercel

Check that Vercel is using the production OAuth app credentials and that the production OAuth app has this callback:

```txt
https://<your-vercel-domain>/api/auth/callback/github
```

### Team chat shows offline

Check:

- `NEXT_PUBLIC_REALTIME_URL` in Vercel or local `.env.local`.
- Railway service public URL.
- `WEB_ORIGIN` in Railway.
- Matching `SOCKET_TOKEN_SECRET` in both web and realtime services.
- Browser console and Railway logs for Socket.IO CORS or auth errors.

### Invitations or notifications do not update

Use the refresh button to verify database state first. If database state is correct but realtime does not update, check the realtime URL, socket secret, and Railway logs.

### AI Assist fails in production

Check that `HF_TOKEN` and `HF_MODEL` are set in Vercel. Redeploy after adding or changing them.

### Resource upload fails

Check that Cloudinary variables are set in Vercel or `.env.local`. The API secret must not be exposed with a `NEXT_PUBLIC_` prefix.

## Quality checks

Run these commands before deploying:

```bash
npm run typecheck
npm run lint
npm run build
```

Run tests if available:

```bash
npm run test
```

## Security notes

- Do not commit `.env.local`, production secrets, OAuth secrets, Cloudinary secrets, or Hugging Face tokens.
- Use separate GitHub OAuth apps for local and production environments.
- Rotate any secret that was shared publicly or committed accidentally.
- Only variables prefixed with `NEXT_PUBLIC_` are safe to expose to the browser.
- Keep `CLOUDINARY_API_SECRET`, `AUTH_SECRET`, `AUTH_GITHUB_SECRET`, `SOCKET_TOKEN_SECRET`, and `HF_TOKEN` server-side only.
