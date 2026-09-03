import { prisma } from '../db';
import MonthData from '../domain/monthData';

export default async function getDataByDate(from: Date, to: Date): Promise<MonthData[]> {
  const rows = await prisma.data_monthly.findMany({
    where: {
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
        Number(row.temp_min),
        Number(row.temp_max),
        Number(row.temp_avg),
        row.date,
        row.is_year_statistics ?? false,
        Number(row.rainfall_med),
        row.rain_days ?? 0,
        row.snow_days ?? 0,
      ),
  );
}
