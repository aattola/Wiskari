import { DateTime } from 'luxon';

export function laskePaivat() {
  const now = DateTime.now().setZone('Europe/Helsinki');
  const coming = DateTime.fromISO('2023-07-03').setZone('Europe/Helsinki');

  const diff = coming.diff(now, ['hours', 'days']);

  return { hours: Math.floor(diff.hours), days: diff.days };
}
