import { prisma } from '../db';
import MonthData from '../domain/monthData';

export default async function getDataByDate(
  from: Date,
  to: Date,
  idema: string,
): Promise<MonthData[]> {
  const rows = await prisma.data_monthly.findMany({
    where: {
      idema,
      date: { gte: from, lte: to },
      // Annual year statistics (month 13) are stored on Dec 31; exclude them
      // from month-range queries.
      is_year_statistics: { not: true },
    },
  });

  return rows.map(
    (row) =>
      new MonthData(
        row.idema,
        toNumberOrNull(row.temp_min),
        toNumberOrNull(row.temp_max),
        toNumberOrNull(row.temp_avg),
        row.date,
        row.is_year_statistics ?? false,
        toNumberOrNull(row.rainfall_med),
        row.rain_days,
        row.snow_days,
      ),
  );
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : value === null ? null : Number(value);
}
