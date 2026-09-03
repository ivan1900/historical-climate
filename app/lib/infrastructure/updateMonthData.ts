import { prisma } from '../db';
import MonthData from '../domain/monthData';

export default async function updateMonthData(monthData: MonthData[]) {
  await prisma.$transaction(
    monthData.map((data) =>
      prisma.data_monthly.upsert({
        where: {
          idema_date: {
            idema: data.getIdema(),
            date: data.getDate(),
          },
        },
        update: {
          temp_min: data.getTempMin(),
          temp_max: data.getTempMax(),
          temp_avg: data.getTempAvg(),
          rainfall_med: data.getRainfall(),
          rain_days: data.getRainDays(),
          snow_days: data.getSnowDays(),
        },
        create: {
          idema: data.getIdema(),
          temp_min: data.getTempMin(),
          temp_max: data.getTempMax(),
          temp_avg: data.getTempAvg(),
          rainfall_med: data.getRainfall(),
          rain_days: data.getRainDays(),
          snow_days: data.getSnowDays(),
          date: data.getDate(),
          is_year_statistics: data.getIsYearStatistics(),
        },
      }),
    ),
  );

  console.log(`Se actualizaron los datos mensuales, se insertaron ${monthData.length}.`);
}
