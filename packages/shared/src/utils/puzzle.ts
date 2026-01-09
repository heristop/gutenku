import { GUTENGUESS_LAUNCH_DATE } from '../constants';

export function getPuzzleNumber(dateStr: string): number {
  const launchDate = new Date(GUTENGUESS_LAUNCH_DATE);
  const date = new Date(dateStr);
  const diffTime = date.getTime() - launchDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}
