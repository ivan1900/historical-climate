import { MantineProvider } from '@mantine/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import searchByDate from '../server/application/searchByDate';
import searchByDateWithComparison from '../server/application/searchByDateWithComparison';
import { searchStations } from '../server/application/searchStations';
import type { MonthDataDTO } from '../server/domain/monthData';
import { SearchSection } from './SearchSection';

const { lineChartSpy } = vi.hoisted(() => ({ lineChartSpy: vi.fn() }));

// The real LineChart needs a sized container (0x0 in jsdom), so stub it and
// assert on the chart presence.
vi.mock('@mantine/charts', () => ({
  LineChart: (props: Record<string, unknown>) => {
    lineChartSpy(props);
    return <div data-testid="line-chart" />;
  },
}));

// The calendar interaction of the real range picker is covered end to end.
// Here it is replaced by a button that selects a deterministic period, so this
// suite can focus on the form orchestration.
vi.mock('@mantine/dates', () => ({
  MonthPickerInput: ({
    label,
    onChange,
  }: {
    label: string;
    onChange: (value: [string, string]) => void;
  }) => (
    <div>
      <span>{label}</span>
      <button type="button" onClick={() => onChange(['2020-01', '2020-06'])}>
        pick-period
      </button>
    </div>
  ),
}));

vi.mock('../server/application/searchStations', () => ({
  searchStations: vi.fn(),
}));
vi.mock('../server/application/searchByDate', () => ({ default: vi.fn() }));
vi.mock('../server/application/searchByDateWithComparison', () => ({
  default: vi.fn(),
}));

const mockedSearchStations = vi.mocked(searchStations);
const mockedSearchByDate = vi.mocked(searchByDate);
const mockedSearchByDateWithComparison = vi.mocked(searchByDateWithComparison);

const SAMPLE_MONTH_DATA: MonthDataDTO = {
  idema: '0061',
  tempMin: 1,
  tempMax: 10,
  tempAvg: 5,
  date: new Date(Date.UTC(2020, 0, 1)),
  isYearStatistics: false,
  rainfall: 0,
  rainDays: 0,
  snowDays: 0,
};

const LOADING_TEXT = 'Obteniendo datos históricos de AEMET…';

function renderSearchSection() {
  return render(
    <MantineProvider>
      <SearchSection />
    </MantineProvider>,
  );
}

async function selectPeriodAndStation(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('pick-period'));

  const stationInput = screen.getByPlaceholderText('Busca una estación (ej. Madrid)');
  await user.type(stationInput, 'Madrid');
  await user.click(await screen.findByText('Madrid'));
}

describe('SearchSection', () => {
  beforeEach(() => {
    mockedSearchStations.mockReset();
    mockedSearchByDate.mockReset();
    mockedSearchByDateWithComparison.mockReset();

    mockedSearchStations.mockResolvedValue([{ value: '0061', label: 'Madrid' }]);
    mockedSearchByDate.mockResolvedValue([SAMPLE_MONTH_DATA]);
  });

  it('renders the search form', () => {
    renderSearchSection();

    expect(screen.getByText('Periodo')).toBeInTheDocument();
    expect(screen.getByText('Estación')).toBeInTheDocument();
    expect(screen.getByText('Comparar con años atrás')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('renders the how-it-works banner and the missing-data info section', async () => {
    const user = userEvent.setup();

    renderSearchSection();

    expect(screen.getByText('Cómo funciona')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una estación meteorológica')).toBeInTheDocument();
    expect(
      screen.getByText('Indica el periodo de meses que quieres consultar'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Introduce el número de años para comparar con el mismo periodo del pasado (opcional)',
      ),
    ).toBeInTheDocument();

    // Before searching the info is a discreet collapsible: expanding it
    // reveals the explanation and the tips.
    await user.click(screen.getByRole('button', { name: /¿Por qué no veo datos?/ }));

    expect(
      screen.getByText('No todas las estaciones de AEMET disponen de datos históricos completos.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Cambia el rango de meses: acórtalo o consulta un periodo diferente.'),
    ).toBeInTheDocument();
  });

  it('hides the how-it-works banner after the first search while keeping the missing-data info section', async () => {
    const user = userEvent.setup();

    renderSearchSection();
    await selectPeriodAndStation(user);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(screen.queryByText('Cómo funciona')).not.toBeInTheDocument();
    });

    expect(screen.getByText('¿Por qué no veo datos?')).toBeInTheDocument();
  });

  it('shows the loading overlay while the search action is pending', async () => {
    const user = userEvent.setup();

    let resolveSearch: (value: MonthDataDTO[]) => void = () => {};
    mockedSearchByDate.mockImplementation(
      () =>
        new Promise<MonthDataDTO[]>((resolve) => {
          resolveSearch = resolve;
        }),
    );

    renderSearchSection();
    await selectPeriodAndStation(user);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText(LOADING_TEXT)).toBeInTheDocument();

    resolveSearch([SAMPLE_MONTH_DATA]);

    await waitFor(() => {
      expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument();
    });
  });

  it('renders the chart once the search action resolves with data', async () => {
    const user = userEvent.setup();

    renderSearchSection();
    await selectPeriodAndStation(user);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByTestId('line-chart')).toBeInTheDocument();
    expect(lineChartSpy).toHaveBeenCalled();
  });

  it('promotes the missing-data info to a card when a search returns no data', async () => {
    const user = userEvent.setup();

    mockedSearchByDate.mockResolvedValue([]);

    renderSearchSection();
    await selectPeriodAndStation(user);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    // The card variant is not collapsible, so the tips are visible without
    // any extra interaction.
    await waitFor(() => {
      expect(
        screen.getByText('No todas las estaciones de AEMET disponen de datos históricos completos.'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('Prueba con otra estación cercana: suelen cubrir periodos distintos.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /¿Por qué no veo datos?/ })).toBeNull();
  });
});
