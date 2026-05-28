import {
  addMinutesToIsoTimestamp
} from "./baseBackend.js";
import {
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  getBaseCopy,
  normalizeBaseLanguage
} from "./baseLocalization.js";

export const BASE_LOCAL_REMINDER_PERMISSION_STATUSES = Object.freeze({
  UNDETERMINED: "undetermined",
  GRANTED: "granted",
  DENIED: "denied"
});

export const BASE_LOCAL_REMINDER_TRIGGER = "after_first_meaningful_action";
export const BASE_LOCAL_REMINDER_CHANNEL = "local_only";

export const BASE_LOCAL_REMINDER_SCOPE = Object.freeze({
  localOnly: true,
  backendCampaigns: false,
  smartHeartRefillPush: false,
  smartTimerCompletePush: false,
  smartBuildingCompletePush: false
});

export const BASE_LOCAL_REMINDER_TEMPLATES = Object.freeze([
  Object.freeze({
    id: "kingdom_waiting",
    bodyKey: BASE_COPY_KEYS.REMINDER_KINGDOM_WAITING,
    offsetMinutes: 24 * 60
  }),
  Object.freeze({
    id: "one_more_battle",
    bodyKey: BASE_COPY_KEYS.REMINDER_ONE_MORE_BATTLE,
    offsetMinutes: 48 * 60
  }),
  Object.freeze({
    id: "next_upgrade_skill_challenge",
    bodyKey: BASE_COPY_KEYS.REMINDER_NEXT_UPGRADE,
    offsetMinutes: 72 * 60
  })
]);

export function shouldAskLocalReminderPermission({
  hasMeaningfulAction = false,
  permissionStatus = BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED
} = {}) {
  return Boolean(hasMeaningfulAction) &&
    permissionStatus === BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED;
}

export function createLocalReminderPermissionPrompt({
  hasMeaningfulAction = false,
  permissionStatus = BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED,
  language = BASE_LANGUAGES.EN
} = {}) {
  if (!shouldAskLocalReminderPermission({ hasMeaningfulAction, permissionStatus })) {
    return null;
  }

  const normalizedLanguage = normalizeBaseLanguage(language);
  return Object.freeze({
    trigger: BASE_LOCAL_REMINDER_TRIGGER,
    channel: BASE_LOCAL_REMINDER_CHANNEL,
    titleKey: BASE_COPY_KEYS.REMINDER_PERMISSION_TITLE,
    title: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.REMINDER_PERMISSION_TITLE),
    bodyKey: BASE_COPY_KEYS.REMINDER_PERMISSION_BODY,
    body: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.REMINDER_PERMISSION_BODY),
    ctaKey: BASE_COPY_KEYS.REMINDER_PERMISSION_CTA,
    cta: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.REMINDER_PERMISSION_CTA)
  });
}

export function createLocalReminderSchedule({
  hasMeaningfulAction = false,
  permissionStatus = BASE_LOCAL_REMINDER_PERMISSION_STATUSES.UNDETERMINED,
  serverNow,
  language = BASE_LANGUAGES.EN
} = {}) {
  if (
    !hasMeaningfulAction ||
    permissionStatus !== BASE_LOCAL_REMINDER_PERMISSION_STATUSES.GRANTED
  ) {
    return [];
  }

  assertIsoTimestamp(serverNow, "serverNow");
  const normalizedLanguage = normalizeBaseLanguage(language);
  const title = getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.REMINDER_NOTIFICATION_TITLE);

  return BASE_LOCAL_REMINDER_TEMPLATES.map((template) => Object.freeze({
    id: template.id,
    channel: BASE_LOCAL_REMINDER_CHANNEL,
    trigger: BASE_LOCAL_REMINDER_TRIGGER,
    titleKey: BASE_COPY_KEYS.REMINDER_NOTIFICATION_TITLE,
    title,
    bodyKey: template.bodyKey,
    body: getBaseCopy(normalizedLanguage, template.bodyKey),
    offsetMinutes: template.offsetMinutes,
    scheduledAt: addMinutesToIsoTimestamp(serverNow, template.offsetMinutes)
  }));
}

function assertIsoTimestamp(value, name) {
  if (typeof value !== "string" || value.length === 0 || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${name} must be an ISO timestamp`);
  }
}
