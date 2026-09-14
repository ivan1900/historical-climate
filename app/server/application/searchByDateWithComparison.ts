'use server';
import dayjs from 'dayjs';

import type { MonthDataDTO } from '../domain/monthData';
import searchByDate from './searchByDate';

export default async function searchByDateWithComparison(
  from: Date,
  to: Date,
  idema: string,
  yearsAgo: number,
): Promise<{ current: MonthDataDTO[]; comparison: MonthDataDTO[] | null }> {
  // No comparison requested: fetch only the current range.
  if (!yearsAgo || yearsAgo <= 0) {
    return { current: await searchByDate(from, to, idema), comparison: null };
  }

  const comparisonFrom = dayjs(from).subtract(yearsAgo, 'year').toDate();
  const comparisonTo = dayjs(to).subtract(yearsAgo, 'year').toDate();

  // Both ranges are fetched inside this single server action (Next.js 16
  // dispatches server actions sequentially per client, so parallel work must
  // happen server-side).
  const [current, comparison] = await Promise.all([
    searchByDate(from, to, idema),
    searchByDate(comparisonFrom, comparisonTo, idema),
  ]);

  return { current, comparison };
}
