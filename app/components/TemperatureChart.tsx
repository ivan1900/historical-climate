'use client';

import { LineChart } from '@mantine/charts';
import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';

import type { MonthDataDTO } from '../lib/domain/monthData';

type TemperatureChartProps = {
  data: MonthDataDTO[];
  hasSearched?: boolean;
};

type ChartPoint = {
  month: string;
  'Temperatura media': number | null;
  'Temperatura máxima': number | null;
};

export function TemperatureChart({ data, hasSearched = false }: TemperatureChartProps) {
  const chartData = data
    .filter((item) => !item.isYearStatistics)
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .map((item): ChartPoint => ({
      month: dayjs(item.date).format('MM/YYYY'),
      'Temperatura media': item.tempAvg,
      'Temperatura máxima': item.tempMax,
    }));

  if (hasSearched && chartData.length === 0) {
    return (
      <Text mt="xl" ta="center" c="dimmed">
        No hay datos de temperaturas para el período seleccionado
      </Text>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Box w={{ base: '90%', md: '80%' }} mx="auto">
      <LineChart
        h={{ base: 300, md: 480 }}
        mt="xl"
        data={chartData}
        dataKey="month"
        withLegend
        legendProps={{ verticalAlign: 'bottom' }}
        unit="°C"
        xAxisLabel="Mes"
        yAxisLabel="Temperatura (°C)"
        curveType="linear"
        strokeWidth={2}
        connectNulls={false}
        series={[
          { name: 'Temperatura media', color: 'blue.6' },
          { name: 'Temperatura máxima', color: 'red.6' },
        ]}
      />
    </Box>
  );
}
