'use server';
import dayjs, { type Dayjs } from 'dayjs';

import type { MonthDataDTO } from '../domain/monthData';
import type MonthData from '../domain/monthData';
import getDataByDate from '../infrastructure/getDataByDate';
import fetchMonthData from './fetchMonthData';

const MAX_AEMET_YEARS_PER_REQUEST = 2;

export default async function searchByDate(
  from: Date,
  to: Date,
  idema: string,
): Promise<MonthDataDTO[]> {
  const start = dayjs(from);
  const end = dayjs(to);

  // 1. Try the database first.
  let monthData = await getDataByDate(from, to, idema);
  const emptyYears = new Set<number>();

  // 2. Fetch from AEMET only the years with missing months, chunked by at
  //    most 2 years per request. Years AEMET returned empty for are skipped
  //    for the rest of the request, so permanently missing months are not
  //    refetched forever.
  const missingYears = getMissingYears(start, end, monthData);
  for (const yearChunk of chunkYears(missingYears, MAX_AEMET_YEARS_PER_REQUEST)) {
    if (yearChunk.some((year) => emptyYears.has(year))) {
      continue;
    }

    let fetched: MonthData[];
    try {
      fetched = await fetchMonthData(
        yearChunk[0].toString(),
        yearChunk[yearChunk.length - 1].toString(),
        idema,
      );
    } catch {
      // AEMET is not always available: keep whatever we already have and
      // continue with the next chunk.
      continue;
    }

    for (const data of fetched) {
      if (emptyYears.has(dayjs(data.getDate()).year())) {
        emptyYears.delete(dayjs(data.getDate()).year());
      }
    }
    if (fetched.length === 0) {
      yearChunk.forEach((year) => emptyYears.add(year));
    }
    monthData = monthData.concat(fetched);
  }

  // 3. Return only the months within the requested range.
  return monthData
    .filter(
      (data) =>
        dayjs(data.getDate()).isSame(start, 'month') ||
        (dayjs(data.getDate()).isAfter(start, 'month') &&
          dayjs(data.getDate()).isBefore(end, 'month')) ||
        dayjs(data.getDate()).isSame(end, 'month'),
    )
    .map((data) => data.toDTO());
}

function getMissingYears(start: Dayjs, end: Dayjs, monthData: MonthData[]): number[] {
  const monthKeysInDb = new Set(monthData.map((data) => dayjs(data.getDate()).format('YYYY-MM')));

  const missingYears: number[] = [];
  for (let year = start.year(); year <= end.year(); year++) {
    const missing = [...Array(12).keys()]
      .map((month) => `${year}-${String(month + 1).padStart(2, '0')}`)
      .filter((monthKey) => !monthKeyInRange(monthKey, start, end) || !monthKeysInDb.has(monthKey));

    if (missing.length > 0) {
      missingYears.push(year);
    }
  }

  return missingYears;
}

function monthKeyInRange(monthKey: string, start: Dayjs, end: Dayjs): boolean {
  return monthKey >= start.format('YYYY-MM') && monthKey <= end.format('YYYY-MM');
}

function chunkYears(years: number[], chunkSize: number): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < years.length; i += chunkSize) {
    chunks.push(years.slice(i, i + chunkSize));
  }
  return chunks;
}
