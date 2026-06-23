# MongoDB collections

| Collection | Purpose | Required indexes |
| --- | --- | --- |
| `users` | Auth.js users plus Matchmaker profile data | default Auth.js indexes |
| `accounts` / `sessions` | Auth.js OAuth state | default Auth.js indexes |
| `projects` | Project briefs and current member IDs | unique `slug`, `status + createdAt` |
| `applications` | Developer applications | unique `projectId + applicantId` |
| `invitations` | Owner-to-developer project invitations | unique `projectId + recipientId` |
| `workspaceMemberships` | Explicit project workspace access | unique `projectId + userId` |
| `chatMessages` | Persisted team messages | `projectId + createdAt` |

Profile fields are added to the Auth.js `users` document during GitHub sync. Access control is always verified against project membership; a Socket.IO ticket has a five-minute lifetime and is restricted to one project.
