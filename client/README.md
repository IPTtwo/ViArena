# ViArena Frontend | Organized React Project

This is the organized, frontend-first ViArena implementation based on the revised IPT2 product specification. It includes screens for Participant, Organizer, and Admin roles and scoped event teams.

## Setup in VS Code

Open the folder containing `package.json` (the `client` folder) in a terminal:

```bash
npm ci
npm run dev
```

Open the Vite URL shown in the terminal. To run local tests:

```bash
npm test
npm run build
npm run format:check
```

The Node tests cover Arena event selection, including draft visibility, ordering, and live-event boundaries. The build checks the production bundle. Run browser checks separately to verify the UI.

`npm ci` installs dependencies into `node_modules/`. That folder is local-only and is ignored by Git. The exact dependency versions are recorded in `package-lock.json`.

To create the production bundle:

```bash
npm run build
```

Vite writes the generated files to `dist/`. The `dist/` folder is also ignored by Git and can be regenerated at any time. Edit files under `src/`, not `dist/`.

## Demo accounts for local UI checks

These are **development fixtures only**. They are not real accounts and they are not safe to deploy.

| View        | Email                   | Fixture password |
| ----------- | ----------------------- | ---------------- |
| Admin       | `admin@adnu.edu.ph`     | `pa55`           |
| Organizer   | `organizer@adnu.edu.ph` | `pa55`           |
| Participant | `yjw@adnu.edu.ph`       | `pa55`           |

New accounts are always Participants. The sign-up form requires a password with at least 8 characters. The fixture passwords above are independent of sign-up policy. Data are stored in the **local browser** using keys beginning with `viarena_p2_`; to reset the preview, delete those keys using browser developer tools. Do not use this local storage implementation as production authentication or authorization.

Password recovery requires a real API configured via `VITE_API_BASE_URL` and is not functional without it. No Express/MongoDB server implementation is bundled.

## Code structure

```text
client/
  src/
    app/                 Router and protected route wrappers
    assets/              Brand assets
    components/
      ui/                Public barrel for reusable buttons, cards, fields, dialogs, badges
      navigation/        Public barrel for sidebar and guest/app layouts
      events/            Reusable event-related controls
      index.js           Single public entry point for shared components
    data/                Development fixtures
    features/
      auth/components/   Sign in, sign up, recovery and landing
      participant/components/  Events, profile, calendar, teams, tasks, history, certificates
      organizer/components/    Event editing, team roles, schedules, streaming and registration tools
      admin/components/       User management, audit, event oversight
      admin/hooks/            Admin-specific React hooks
      participant/components/arena/  Arena event links and poster presentation
      participant/functions/  Pure Arena event selection logic
    functions/           Pure JavaScript: permissions, validation, filtering, formatting, embed URLs
    state/               Centralized frontend state and local persistence
    styles/              Global tokens, shared layout, separate role-specific CSS
    types/               TypeScript data types (no runtime logic)
    main.jsx             React entry point
  tests/                 Node tests for business logic
```

**Components** are React `.jsx` modules under `components/` or the corresponding `features/*/components/` folder. Import shared components through `components/index.js` or its grouped barrels (`components/ui`, `components/navigation`, and `components/events`) instead of importing implementation files throughout the app. Feature-specific screens stay inside their feature folder. **Functions** are business logic `.js` modules under `functions/` or role-specific `features/*/functions/`. **Types** are in `.ts`; all styling remains in `.css` files. This preserves JavaScript React without a disruptive migration of every existing component to TypeScript.

## Routing

Application routes are defined in `src/app/AppRoutes.jsx`. Authentication and role checks are kept in `src/app/guards.jsx`. Public event pages, authenticated participant pages, organizer tools, and admin pages are separated by route and protected where required.

## Where to make changes

| Task | Start here |
| --- | --- |
| Add or change a route | `src/app/AppRoutes.jsx` |
| Change sidebar or guest navigation | `src/components/navigation/` |
| Change the Arena page | `src/features/participant/components/ArenaOverview.jsx` |
| Change Arena posters or event links | `src/features/participant/components/arena/` |
| Change which events appear in the Arena | `src/features/participant/functions/arena.js` |
| Change shared colors or spacing | `src/styles/tokens.css` |
| Change Arena styling | `src/styles/arena.css` (all Arena-specific CSS lives here) |
| Change reusable UI | `src/components/ui/` |
| Change saved data or account behavior | `src/state/StoreProvider.jsx` |

Keep page composition in the page component, small presentation pieces in a nearby component folder, pure calculations in `functions/`, and React hooks in `hooks/`. Avoid creating empty placeholder folders or importing unused components in anticipation of future work.

Run `npm run format` to format source and tests, and `npm run format:check` before a commit. Prettier is a development-only dependency. Playwright is also installed for future browser checks; download its browser with `npx playwright install chromium`. No Playwright test suite is configured yet.

Personal `.codex/` hooks and `.vscode/` tasks are ignored because they can contain machine-specific paths. They remain available locally. Generated bundles, dependencies, browser reports, and test artifacts are also ignored.

## Product rules

- Primary color `#00296B` and Poppins, spacing based on 4 px increments.
- No Participant dashboard. `/dashboard` redirects to `/events`.
- No public role dropdown or Organizer access applications. Admins appoint Organizers.
- Organizers assign Team Managers and Handlers for event-specific teams. Team Managers coordinate their assigned teams but cannot appoint team leaders.
- Only authorized event staff can edit official event schedules. Participants, Handlers, and Team Managers view them without edit/request controls.
- The logo opens `/arena`; profile links remain available in account navigation.
- Draft events are hidden from public discovery. Published events support participant registration and cancellation.
- Certificates are downloadable as SVG **after a local participation-verification record**.
- YouTube streams may be embedded; unsupported embedding has an external-link fallback.

## What is implemented versus what is not

**Implemented as frontend flows:** all routes in the revised 35-frame inventory, shared responsive navigation, form controls, event management, event-based teams and task controls, view-only calendar and schedule editor, streams/watch page, history, certificate download, Admin role assignment and audit screens.

**Not implemented as deployable backend functionality:** Express/MongoDB APIs, secured sessions, emailed password reset, server-enforced RBAC, concurrent registration capacity protection, durable shared multi-user persistence, official certificate verification, or live streaming infrastructure. Data changes occur only in each browser's local storage.

Do not deploy the preview with real student information or rely on frontend guards as authorization. Server APIs and verified sessions must replace the development store before production use.

## GitHub collaboration

Use one ticket per branch and one pull request per ticket. Keep generated folders such as `node_modules/` and `dist/` out of commits. The route integration and reusable component structure are now part of the main application; future changes should build on `src/app/` and `src/components/`.
