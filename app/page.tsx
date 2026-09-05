'use client';

import {
  Autocomplete,
  Box,
  Button,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import dayjs from 'dayjs';
import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import { TemperatureChart } from './components/TemperatureChart';
import searchByDate from './lib/application/searchByDate';
import { searchStations } from './lib/application/searchStations';
import type { MonthDataDTO } from './lib/domain/monthData';

type StationSuggestion = {
  value: string;
  label: string;
};

export default function Home() {
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
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSearch = Boolean(period[0] && period[1] && selectedStationIdema);

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
      const data = await searchByDate(
        dayjs(from, 'YYYY-MM').toDate(),
        dayjs(to, 'YYYY-MM').toDate(),
        selectedStationIdema,
      );
      setSearchResult(data);
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
      <Box w='100%' px={{ base: 'md', md: 'xl' }} py='xl' className='flex-1'>
        <Stack gap='lg' w={{ base: '90%', md: '30%' }} mx='auto'>
          <Stack gap={4}>
            <Title order={1}>Clima histórico</Title>
            <Text c='dimmed'>
              Consulta los datos climáticos históricos de cualquier población
              española
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

              <Autocomplete
                label='Población'
                placeholder='Busca una población (ej. Madrid)'
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

        <TemperatureChart data={searchResult} hasSearched={hasSearched} />
      </Box>
    </>
  );
}
