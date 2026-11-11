import test from "node:test";
import assert from "node:assert/strict";
import {
  canCreateEvent,
  canManageEvent,
  canManageRegistrations,
  canViewPrivateEvent,
  registrationEligibility,
  validateEvent,
  validSchoolEmail,
} from "../src/functions/domain.js";
const person = (id, roles = ["Participant"]) => ({ id, roles });
const owner = person("owner", ["Participant", "Organizer"]),
  admin = person("admin", ["Participant", "Admin"]),
  stranger = person("stranger", ["Participant", "Organizer"]),
  member = person("member");
const event = {
  id: "event",
  title: "Campus Cup",
  description: "Competition",
  category: "Esports",
  venue: "Gym",
  visibility: "Published",
  capacity: 2,
  ownerId: "owner",
  start: "2027-12-10T09:00",
  end: "2027-12-10T17:00",
  deadline: "2027-12-08T22:00",
  coOrganizers: [{ userId: "co", permissions: ["manage_registrations"] }],
};
const at = new Date("2027-11-01T00:00");
test("account role permits creation but not another organizer event editing", () => {
  assert.ok(canCreateEvent(owner));
  assert.ok(canCreateEvent(admin));
  assert.equal(canCreateEvent(member), false);
  assert.ok(canManageEvent(event, owner));
  assert.ok(canManageEvent(event, admin));
  assert.equal(canManageEvent(event, stranger), false);
});
test("co-organizer permission is resource and operation specific", () => {
  const co = person("co");
  assert.equal(canManageEvent(event, co), false);
  assert.ok(canManageRegistrations(event, co));
  assert.equal(
    canManageRegistrations({ ...event, coOrganizers: [] }, co),
    false,
  );
});
test("private draft inaccessible to unrelated users", () => {
  const draft = { ...event, visibility: "Draft" };
  assert.equal(canViewPrivateEvent(draft, member), false);
  assert.ok(canViewPrivateEvent(draft, owner));
  assert.ok(canViewPrivateEvent(event, member));
});
test("published event registration eligibility and limits", () => {
  assert.equal(registrationEligibility(event, 0, false, at).allowed, true);
  assert.equal(registrationEligibility(event, 2, false, at).code, "full");
  assert.equal(registrationEligibility(event, 0, true, at).code, "registered");
  assert.equal(
    registrationEligibility({ ...event, visibility: "Draft" }, 0, false, at)
      .allowed,
    false,
  );
  assert.equal(
    registrationEligibility(event, 0, false, new Date("2027-12-09T09:00")).code,
    "closed",
  );
  assert.equal(
    registrationEligibility(event, 0, false, new Date("2027-12-11T09:00")).code,
    "ended",
  );
});
test("publish validation and draft flexibility", () => {
  assert.equal(validateEvent(event, true, 0, at), "");
  assert.match(
    validateEvent({ ...event, capacity: 1 }, true, 2, at),
    /Capacity/,
  );
  assert.match(
    validateEvent({ ...event, end: "2027-12-01T09:00" }, true, 0, at),
    /end time/,
  );
  assert.equal(
    validateEvent({ title: "Draft", capacity: 20 }, false, 0, at),
    "",
  );
});
test("school email only", () => {
  assert.ok(validSchoolEmail("USER@ADNU.EDU.PH"));
  assert.equal(validSchoolEmail("user@gmail.com"), false);
});
