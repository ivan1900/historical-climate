'use client';

import { LineChart } from '@mantine/charts';
import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';

import type { MonthDataDTO } from '../lib/domain/monthData';

type TemperatureChartProps = {
  data: MonthDataDTO[];
  comparisonData?: MonthDataDTO[] | null;
  comparisonLabel?: string;
  hasSearched?: boolean;
};

function sortByDate(items: MonthDataDTO[]): MonthDataDTO[] {
  return [...items]
    .filter((item) => !item.isYearStatistics)
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
}

export function TemperatureChart({
  data,
  comparisonData = null,
  comparisonLabel,
  hasSearched = false,
}: TemperatureChartProps) {
  const currentItems = sortByDate(data);
  const comparisonItems = sortByDate(comparisonData ?? []);
  const hasComparison = comparisonItems.length > 0;

  // The series names double as the data keys @mantine/charts looks up, so the
  // same strings must be used in both the chart points and the series prop.
  const avgComparisonName = `Temperatura media (${comparisonLabel ?? 'comparación'})`;
  const maxComparisonName = `Temperatura media máxima (${comparisonLabel ?? 'comparación'})`;

  // The comparison range is the current one shifted back by whole years, so
  // each current month matches the comparison month N years earlier. Joining
  // by the shifted date keeps the series aligned even when months are missing
  // on either side.
  const comparisonByMonth = new Map(
    comparisonItems.map((item) => [dayjs(item.date).format('YYYY-MM'), item]),
  );
  const currentFirst = currentItems[0]?.date;
  const comparisonFirst = comparisonItems[0]?.date;
  const yearShift =
    currentFirst && comparisonFirst
      ? dayjs(currentFirst).year() - dayjs(comparisonFirst).year()
      : 0;

  const chartData: Record<string, string | number | null>[] = currentItems.map(
    (item) => {
      const point: Record<string, string | number | null> = {
        month: dayjs(item.date).format('MM/YYYY'),
        'Temperatura media': item.tempAvg,
        'Temperatura media máxima': item.tempMax,
      };

      if (hasComparison) {
        const comparisonKey = dayjs(item.date)
          .subtract(yearShift, 'year')
          .format('YYYY-MM');
        const comparison = comparisonByMonth.get(comparisonKey);
        point[avgComparisonName] = comparison?.tempAvg ?? null;
        point[maxComparisonName] = comparison?.tempMax ?? null;
      }

      return point;
    },
  );

  const currentSeries = [
    { name: 'Temperatura media', color: 'blue.6' },
    { name: 'Temperatura media máxima', color: 'red.6' },
  ];

  // Comparison lines are drawn dashed and thinner to visually recede behind
  // the current period lines.
  const comparisonSeries = hasComparison
    ? [
        { name: avgComparisonName, color: 'blue.2', strokeDasharray: '6 4' },
        { name: maxComparisonName, color: 'red.2', strokeDasharray: '6 4' },
      ]
    : [];

  const series = [...currentSeries, ...comparisonSeries];

  if (hasSearched && chartData.length === 0) {
    return (
      <Text mt='xl' ta='center' c='dimmed'>
        No hay datos de temperaturas para el período seleccionado
      </Text>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Box w={{ base: '90%', md: '80%' }} mx='auto'>
      <LineChart
        h={{ base: 300, md: 480 }}
        mt='xl'
        data={chartData}
        dataKey='month'
        withLegend
        legendProps={{ verticalAlign: 'bottom' }}
        unit='°C'
        xAxisLabel='Mes'
        yAxisLabel='Temperatura (°C)'
        curveType='linear'
        strokeWidth={2}
        connectNulls={false}
        withPointLabels
        // Point labels only on the current series: the comparison lines would
        // add 24 more labels and make the chart unreadable.
        lineProps={(s) =>
          s.name === avgComparisonName || s.name === maxComparisonName
            ? {
                label: false,
                strokeWidth: 1,
                dot: { r: 3, strokeWidth: 1 },
                activeDot: { r: 4, strokeWidth: 1 },
              }
            : { label: { fontSize: 14, position: 'top' } }
        }
        series={series}
      />
    </Box>
  );
}
