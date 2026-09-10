'use client';

import {
  Autocomplete,
  Box,
  Button,
  Loader,
  NumberInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import dayjs from 'dayjs';
import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import searchByDate from '../lib/application/searchByDate';
import searchByDateWithComparison from '../lib/application/searchByDateWithComparison';
import { searchStations } from '../lib/application/searchStations';
import type { MonthDataDTO } from '../lib/domain/monthData';
import { TemperatureChart } from './TemperatureChart';

type StationSuggestion = {
  value: string;
  label: string;
};

export function SearchSection() {
  const [period, setPeriod] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const maxDate = dayjs().subtract(1, 'month').format('YYYY-MM');

  const monthKeys = period.map((date) =>
    date ? dayjs(date).format('YYYY-MM') : null,
  );

  const [stationQuery, setStationQuery] = useState('');
  const [selectedStationIdema, setSelectedStationIdema] = useState('');
  const [stations, setStations] = useState<StationSuggestion[]>([]);
  const [debouncedStationQuery] = useDebouncedValue(stationQuery, 300);

  const [searchResult, setSearchResult] = useState<MonthDataDTO[]>([]);
  const [comparisonResult, setComparisonResult] = useState<
    MonthDataDTO[] | null
  >(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [yearsAgo, setYearsAgo] = useState<number | string>('');
  const [isPending, startTransition] = useTransition();

  const canSearch = Boolean(period[0] && period[1] && selectedStationIdema);
  const yearsAgoNumber = Number(yearsAgo);

  const requestRef = useRef(0);

  useEffect(() => {
    const query = debouncedStationQuery.trim();

    if (query.length < 2) {
      setStations([]);
      return;
    }

    const requestId = ++requestRef.current;

    searchStations(query).then((data) => {
      if (requestId === requestRef.current) {
        setStations(data);
      }
    });
  }, [debouncedStationQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const [from, to] = period;
    if (!from || !to || !selectedStationIdema) {
      return;
    }

    startTransition(async () => {
      const fromDate = dayjs(from, 'YYYY-MM').toDate();
      const toDate = dayjs(to, 'YYYY-MM').toDate();

      if (yearsAgoNumber > 0) {
        const result = await searchByDateWithComparison(
          fromDate,
          toDate,
          selectedStationIdema,
          yearsAgoNumber,
        );
        setSearchResult(result.current);
        setComparisonResult(result.comparison);
      } else {
        const data = await searchByDate(fromDate, toDate, selectedStationIdema);
        setSearchResult(data);
        setComparisonResult(null);
      }
      setHasSearched(true);
    });
  };

  return (
    <>
      {isPending && (
        <div
          aria-live='polite'
          className='fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70'>
          <Stack gap='md' align='center'>
            <Loader size='xl' />
            <Text size='lg'>Obteniendo datos históricos de AEMET…</Text>
          </Stack>
        </div>
      )}

      <Box
        component='section'
        id='buscar'
        w='100%'
        px={{ base: 'md', md: 'xl' }}
        py='xl'
        className='flex-1'>
        <Box maw={1100} mx='auto'>
          <Stack gap='lg' w={{ base: '100%', md: '50%' }} mx='auto'>
            <Stack gap={4}>
              <Title order={2}>Consulta el clima histórico</Title>
              <Text c='dimmed'>
                Elige un periodo y una estación para ver la evolución de las
                temperaturas
              </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap='lg'>
                <MonthPickerInput
                  type='range'
                  label='Periodo'
                  placeholder='Selecciona el rango de meses'
                  valueFormat='MM/YYYY'
                  clearable
                  maxDate={maxDate}
                  value={period}
                  onChange={setPeriod}
                />

                {monthKeys[0] && monthKeys[1] && (
                  <Text size='sm' c='dimmed'>
                    Rango seleccionado: {monthKeys[0]} – {monthKeys[1]}
                  </Text>
                )}

                <NumberInput
                  label='Comparar con años atrás'
                  placeholder='10'
                  description='Compara el periodo seleccionado con el mismo periodo N años antes'
                  min={0}
                  allowDecimal={false}
                  hideControls
                  value={yearsAgo}
                  onChange={setYearsAgo}
                />

                <Autocomplete
                  label='Estación'
                  placeholder='Busca una estación (ej. Madrid)'
                  data={stations}
                  limit={10}
                  value={stationQuery}
                  onChange={setStationQuery}
                  onOptionSubmit={setSelectedStationIdema}
                  filter={({ options }) => options}
                />

                <Button
                  type='submit'
                  fullWidth
                  size='md'
                  loading={isPending}
                  disabled={!canSearch}>
                  Buscar
                </Button>
              </Stack>
            </form>
          </Stack>

          <TemperatureChart
            data={searchResult}
            comparisonData={comparisonResult}
            comparisonLabel={`hace ${yearsAgoNumber} años`}
            hasSearched={hasSearched}
          />
        </Box>
      </Box>
    </>
  );
}
