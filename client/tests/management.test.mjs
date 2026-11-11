import test from "node:test";
import assert from "node:assert/strict";
import {
  filterRegistrations,
  filterMembers,
  canAssignOrganizer,
} from "../src/functions/domain.js";
const users = [
  {
    id: "admin",
    name: "Admin Rivera",
    email: "admin@adnu.edu.ph",
    studentId: "STAFF-1",
    roles: ["Participant", "Admin"],
  },
  {
    id: "owner",
    name: "Rica Cruz",
    email: "rica@adnu.edu.ph",
    studentId: "STAFF-2",
    roles: ["Participant", "Organizer"],
  },
  {
    id: "participant",
    name: "Mika Santos",
    email: "mika@adnu.edu.ph",
    studentId: "2026-001",
    roles: ["Participant"],
  },
];
const entries = [
  {
    id: "r1",
    eventId: "a",
    userId: "participant",
    status: "Registered",
    createdAt: "2026-11-01",
  },
  {
    id: "r2",
    eventId: "a",
    userId: "owner",
    status: "Canceled",
    createdAt: "2026-11-02",
  },
  {
    id: "r3",
    eventId: "b",
    userId: "participant",
    status: "Registered",
    createdAt: "2026-11-03",
  },
];
test("VIA-207 only shows event-scoped registrations with requested status", () => {
  const rows = filterRegistrations(entries, users, "a", "", "Registered");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].member.name, "Mika Santos");
  assert.equal(filterRegistrations(entries, users, "b", "", "All").length, 1);
});
test("VIA-207 search matches name, school email and student ID", () => {
  assert.equal(
    filterRegistrations(entries, users, "a", "2026-001", "All").length,
    1,
  );
  assert.equal(
    filterRegistrations(entries, users, "a", "RICA", "All").length,
    1,
  );
  assert.equal(
    filterRegistrations(entries, users, "a", "missing", "All").length,
    0,
  );
});
test("VIA-208 admin list filters by role and name", () => {
  assert.deepEqual(
    filterMembers(users, "", "Organizer").map((u) => u.id),
    ["owner"],
  );
  assert.equal(filterMembers(users, "mika", "All").length, 1);
  assert.equal(filterMembers(users, "staff-1", "All")[0].id, "admin");
});
test("VIA-208 Organizer assignment requires Admin and cannot modify an Admin", () => {
  const [admin, owner, participant] = users;
  assert.equal(
    canAssignOrganizer(participant, owner, [], false).allowed,
    false,
  );
  assert.equal(canAssignOrganizer(admin, participant, [], true).allowed, true);
  assert.equal(canAssignOrganizer(admin, admin, [], true).allowed, false);
});
test("VIA-208 owned events block Organizer revocation", () => {
  const [admin, owner] = users;
  assert.match(
    canAssignOrganizer(admin, owner, [{ ownerId: "owner" }], false).reason,
    /Reassign/,
  );
  assert.equal(canAssignOrganizer(admin, owner, [], false).allowed, true);
});
