'use server';
import dayjs from 'dayjs';

import type { MonthDataDTO } from '../domain/monthData';
import getDataByDate from '../infrastructure/getDataByDate';
import fetchMonthData from './fetchMonthData';

export default async function searchByDate(
  from: Date,
  to: Date,
  idema: string,
): Promise<MonthDataDTO[]> {
  const start = dayjs(from);
  const end = dayjs(to);
  const countMonths = end.diff(start, 'month') + 1;
  let monthData = await getDataByDate(from, to);
  if (countMonths > monthData.length) {
    // intentar obtener de api aemet
    const startYear = start.year().toString();
    const endYear = end.year().toString();
    monthData = await fetchMonthData(startYear, endYear, idema);
  }

  return monthData.map((data) => data.toDTO());
}
