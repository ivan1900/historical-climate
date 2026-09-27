import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MonthDataDTO } from '../server/domain/monthData';
import { TemperatureChart } from './TemperatureChart';

const { lineChartSpy } = vi.hoisted(() => ({ lineChartSpy: vi.fn() }));

// The real LineChart measures its container, which is 0x0 in jsdom, so it
// renders nothing. Capture the props it receives instead: this keeps the
// private sortByDate helper private while still asserting on the chart output.
vi.mock('@mantine/charts', () => ({
  LineChart: (props: Record<string, unknown>) => {
    lineChartSpy(props);
    return <div data-testid="line-chart" />;
  },
}));

type ChartProps = {
  data: Record<string, string | number | null>[];
  series: { name: string }[];
};

function monthData(overrides: Partial<MonthDataDTO> & { date: Date }): MonthDataDTO {
  return {
    idema: '0061',
    tempMin: 0,
    tempMax: 0,
    tempAvg: 0,
    isYearStatistics: false,
    rainfall: 0,
    rainDays: 0,
    snowDays: 0,
    ...overrides,
  };
}

function renderChart(props: Parameters<typeof TemperatureChart>[0]) {
  return render(
    <MantineProvider>
      <TemperatureChart {...props} />
    </MantineProvider>,
  );
}

function lastChartProps(): ChartProps {
  return lineChartSpy.mock.calls.at(-1)?.[0] as ChartProps;
}

describe('TemperatureChart', () => {
  it('renders without crashing with a single series', () => {
    renderChart({
      data: [
        monthData({
          date: new Date(Date.UTC(2020, 0, 1)),
          tempAvg: 5,
          tempMax: 10,
        }),
      ],
    });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    const { data, series } = lastChartProps();
    expect(data).toEqual([
      {
        month: '01/2020',
        'Temperatura media': 5,
        'Temperatura media máxima': 10,
      },
    ]);
    expect(series.map((item) => item.name)).toEqual([
      'Temperatura media',
      'Temperatura media máxima',
    ]);
  });

  it('aligns the comparison series by shifted date, leaving gaps as null', () => {
    const averageComparison = 'Temperatura media (hace 10 años)';
    const maxComparison = 'Temperatura media máxima (hace 10 años)';

    renderChart({
      data: [
        monthData({ date: new Date(Date.UTC(2020, 0, 1)), tempAvg: 5, tempMax: 10 }),
        monthData({ date: new Date(Date.UTC(2020, 1, 1)), tempAvg: 6, tempMax: 11 }),
        monthData({ date: new Date(Date.UTC(2020, 2, 1)), tempAvg: 7, tempMax: 12 }),
      ],
      comparisonData: [
        monthData({ date: new Date(Date.UTC(2010, 0, 1)), tempAvg: -1, tempMax: 2 }),
        monthData({ date: new Date(Date.UTC(2010, 1, 1)), tempAvg: 0, tempMax: 3 }),
      ],
      comparisonLabel: 'hace 10 años',
    });

    const { data, series } = lastChartProps();

    expect(data).toEqual([
      {
        month: '01/2020',
        'Temperatura media': 5,
        'Temperatura media máxima': 10,
        [averageComparison]: -1,
        [maxComparison]: 2,
      },
      {
        month: '02/2020',
        'Temperatura media': 6,
        'Temperatura media máxima': 11,
        [averageComparison]: 0,
        [maxComparison]: 3,
      },
      // March has no comparison month N years earlier, so it stays null.
      {
        month: '03/2020',
        'Temperatura media': 7,
        'Temperatura media máxima': 12,
        [averageComparison]: null,
        [maxComparison]: null,
      },
    ]);
    expect(series.map((item) => item.name)).toEqual([
      'Temperatura media',
      'Temperatura media máxima',
      averageComparison,
      maxComparison,
    ]);
  });

  it('handles empty data without crashing', () => {
    const { unmount } = renderChart({ data: [] });

    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();

    unmount();

    renderChart({ data: [], hasSearched: true });

    expect(
      screen.getByText('No hay datos de temperaturas para el período seleccionado'),
    ).toBeInTheDocument();
  });
});
