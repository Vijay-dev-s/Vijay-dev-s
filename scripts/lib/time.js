'use strict';
/**
 * Resolves which theme + mode should be active right now.
 * Priority: 1) birthday  2) weekday  3) day/night variant.
 * Timezone and day/night boundaries all come from config.timing —
 * nothing here is hardcoded.
 */

function getISTParts(timezone) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
  return {
    weekdayName: parts.weekday.toLowerCase(), // "monday" etc — matches config.themes keys directly
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: parts.hour === '24' ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
    isoTimestamp: now.toISOString(),
  };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function resolveMode(parts, timing) {
  const nowMin = parts.hour * 60 + parts.minute;
  const dayStart = toMinutes(timing.dayStart);
  const nightStart = toMinutes(timing.nightStart);
  return (nowMin >= dayStart && nowMin < nightStart) ? 'day' : 'night';
}

function isBirthday(parts, timing) {
  return parts.month === timing.birthday.month && parts.day === timing.birthday.day;
}

/**
 * @param {object} config  the full themes.json object
 * @returns {{ themeKey: string, mode: 'day'|'night', isBirthday: boolean, weekday: string, ist: object }}
 */
function resolveActiveTheme(config) {
  const parts = getISTParts(config.timing.timezone);
  const mode = resolveMode(parts, config.timing);
  const birthday = isBirthday(parts, config.timing);
  const themeKey = birthday ? 'birthday' : parts.weekdayName;
  return { themeKey, mode, isBirthday: birthday, weekday: parts.weekdayName, ist: parts };
}

module.exports = { getISTParts, resolveMode, isBirthday, resolveActiveTheme };
