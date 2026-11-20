# Coy Discover

A mobile-first discovery app built for the Coy SDE Intern assignment, Part B.

## Features

- 32 mock profiles with photos, bios, locations, and interests.
- Swipe right to like or left to pass, with buttons for both actions.
- Mutual matching with an “It’s a match!” screen and a Matches view.
- Likes remain private until mutual; swiped profiles never return.
- SQLite persistence across page reloads and server restarts.
- Loading, error, and empty states.
- Home and Discover navigation, with Home intentionally blank as required.

## Stack

Next.js App Router, React, TypeScript, SQLite, Zod, SWR, Motion, and Lucide React.

## Getting started

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000/discover](http://localhost:3000/discover).

No API keys or authentication setup are needed. The app assumes one logged-in user and automatically seeds the database on first use. Data is stored in `data/coy.sqlite`; set `COY_DATABASE_PATH` to use a different file.

## Quick demo

With a fresh database:

1. Pass on Aanya.
2. Like Kabir to trigger a seeded mutual match.
3. Open Matches to see Kabir.
4. Reload to confirm the match persists and neither profile returns to Discover.

## API

| Method | Endpoint   | Description                                                    |
| ------ | ---------- | -------------------------------------------------------------- |
| GET    | `/feed`    | Returns profiles the user has not swiped on.                   |
| POST   | `/swipe`   | Records a like or pass and returns whether it created a match. |
| GET    | `/matches` | Returns mutual matches.                                        |

Example swipe request:

```json
{
  "profileId": "profile-02",
  "decision": "like"
}
```

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Browser tests cover mobile and desktop flows, gestures, matching, persistence, request failures, and the empty state:

```sh
npx playwright install chromium webkit
npm run test:e2e
```

Keep port 3000 available for browser tests. They use a separate temporary database.

## Production

```sh
npm run build
npm start
```

SQLite requires a persistent writable disk when deployed.

## Assets

Typography: Bricolage Grotesque via Fontsource. Icons: Lucide. Placeholder portraits: [Random User](https://randomuser.me/). All profile details are fictional.
