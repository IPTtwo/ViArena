import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const root = new URL("../src/", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const routes = read("app/AppRoutes.jsx");
const permissions = read("functions/permissions.js");
const state = read("state/StoreProvider.jsx");
const navigation = read("components/navigation/Shell.jsx");
const guest = read("components/navigation/GuestShell.jsx");
const brand = read("styles/tokens.css");
const checks = [
  ["approved primary color", brand.includes("#00296B")],
  ["Poppins typography", brand.includes("Poppins")],
  [
    "4px spacing token",
    brand.includes("--space-1: 4px") || brand.includes("--space-1:4px"),
  ],
  ["profile logo shortcut", navigation.includes('to="/profile"')],
  [
    "guest logo shortcut",
    guest.includes("user ? '/profile' : '/login'") ||
      guest.includes("user?'/profile':'/login'"),
  ],
  [
    "no participant dashboard route",
    routes.includes(
      'path="/dashboard" element={<Navigate to="/events" replace/>}',
    ) ||
      routes.includes(
        'path="/dashboard" element={<Navigate to="/events" replace />}',
      ),
  ],
  [
    "no participant dashboard sidebar",
    !navigation.includes("to:'/dashboard'") &&
      !navigation.includes("to: '/dashboard'"),
  ],
  [
    "no organizer application",
    !routes.includes("RequestOrganizer") &&
      !routes.includes("OrganizerApplication"),
  ],
  [
    "participant-only new account",
    state.includes("roles: ['Participant']") ||
      state.includes("roles:['Participant']"),
  ],
  [
    "role checks for event owner",
    permissions.includes("event.ownerId === actor.id") ||
      permissions.includes("event.ownerId===actor.id"),
  ],
  [
    "role-aware organizer workspace",
    routes.includes("RequireOrganizerWorkspace"),
  ],
  ["Admin-only user management", routes.includes('role="Admin"><AdminUsers')],
  [
    "organizer-only event creation",
    routes.includes('role="Organizer"><EventEditor'),
  ],
  [
    "calendar read-only for other roles",
    read("features/participant/components/CalendarView.jsx").includes(
      "canManageSchedule",
    ),
  ],
  [
    "schedule editor protected",
    read("features/organizer/components/ScheduleEditor.jsx").includes(
      "canManageSchedule",
    ),
  ],
  ["live video watch page", routes.includes("/events/:eventId/watch")],
  ["real participation history page", /<History\s*\/>/.test(routes)],
  ["real certificates page", /<Certificates\s*\/>/.test(routes)],
  [
    "teams pages",
    /<MyTeams\s*\/>/.test(routes) && /<TeamDetail\s*\/>/.test(routes),
  ],
  [
    "no role dropdown at signup",
    !read("features/auth/components/Auth.jsx").includes("Select account role"),
  ],
  [
    "status color variants",
    /Live\s*:\s*['\"]danger['\"]/.test(read("components/ui/StatusBadge.jsx")),
  ],
];
for (const [label, pass] of checks) {
  assert.ok(pass, `FAIL: ${label}`);
  console.log("PASS:", label);
}
console.log(`Passed ${checks.length} static checks.`);
