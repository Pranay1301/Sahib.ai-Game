import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_LOCAL_REMINDER_CHANNEL,
  BASE_LOCAL_REMINDER_PERMISSION_STATUSES,
  BASE_LOCAL_REMINDER_SCOPE,
  BASE_LOCAL_REMINDER_TEMPLATES,
  BASE_LOCAL_REMINDER_TRIGGER,
  createLocalReminderPermissionPrompt,
  createLocalReminderSchedule,
  shouldAskLocalReminderPermission
} from "../src/base/baseLocalReminders.js";

const SERVER_NOW = "2026-05-28T10:00:00.000Z";

test("Phase 14 reminder scope stays local-only and non-blocking", () => {
  assert.deepEqual(BASE_LOCAL_REMINDER_SCOPE, {
    localOnly: true,
    backendCampaigns: false,
    smartHeartRefillPush: false,
    smartTimerCompletePush: false,
    smartBuildingCompletePush: false
  });
  assert.equal(BASE_LOCAL_REMINDER_CHANNEL, "local_only");
  assert.equal(BASE_LOCAL_REMINDER_TRIGGER, "after_first_meaningful_action");
});

test("notification permission is requested only after a meaningful action", () => {
  assert.equal(shouldAskLocalReminderPermission({
    hasMeaningfulAction: false,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED
  }), false);
  assert.equal(shouldAskLocalReminderPermission({
    hasMeaningfulAction: true,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED
  }), true);
  assert.equal(shouldAskLocalReminderPermission({
    hasMeaningfulAction: true,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.GRANTED
  }), false);
});

test("permission prompt uses localized copy and no backend state", () => {
  const prompt = createLocalReminderPermissionPrompt({
    hasMeaningfulAction: true,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED,
    language: "en"
  });

  assert.equal(prompt.title, "Stay close to your kingdom");
  assert.equal(prompt.body, "Allow simple local reminders after you play or upgrade. No smart campaigns.");
  assert.equal(prompt.cta, "Allow Reminders");
  assert.equal(prompt.channel, "local_only");
});

test("local reminder schedule uses the three documented simple reminders", () => {
  const schedule = createLocalReminderSchedule({
    hasMeaningfulAction: true,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.GRANTED,
    serverNow: SERVER_NOW,
    language: "en"
  });

  assert.equal(schedule.length, 3);
  assert.deepEqual(BASE_LOCAL_REMINDER_TEMPLATES.map((template) => template.offsetMinutes), [
    1440,
    2880,
    4320
  ]);
  assert.deepEqual(schedule.map((reminder) => reminder.body), [
    "Your kingdom is waiting. Play a quick battle and earn coins.",
    "Ready for one more battle? Grow your Sahib kingdom today.",
    "Your next upgrade starts with one skill challenge."
  ]);
  assert.deepEqual(schedule.map((reminder) => reminder.scheduledAt), [
    "2026-05-29T10:00:00.000Z",
    "2026-05-30T10:00:00.000Z",
    "2026-05-31T10:00:00.000Z"
  ]);
  assert.equal(schedule.every((reminder) => reminder.channel === "local_only"), true);
});

test("local reminders do not schedule when permission is missing or action has not happened", () => {
  assert.deepEqual(createLocalReminderSchedule({
    hasMeaningfulAction: false,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.GRANTED,
    serverNow: SERVER_NOW
  }), []);
  assert.deepEqual(createLocalReminderSchedule({
    hasMeaningfulAction: true,
    permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.DENIED,
    serverNow: SERVER_NOW
  }), []);
  assert.throws(
    () => createLocalReminderSchedule({
      hasMeaningfulAction: true,
      permissionStatus: BASE_LOCAL_REMINDER_PERMISSION_STATUSES.GRANTED
    }),
    /serverNow must be an ISO timestamp/
  );
});
