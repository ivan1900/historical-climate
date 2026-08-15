'use client';

import {
  Autocomplete,
  Button,
  Container,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function Home() {
  const [period, setPeriod] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const maxDate = dayjs().subtract(1, 'month').format('YYYY-MM');

  const monthKeys = period.map((date) =>
    date ? dayjs(date).format('YYYY-MM') : null,
  );

  return (
    <Container size='sm' py='xl' className='flex-1'>
      <Stack gap='lg' maw={480} mx='auto' w='100%'>
        <Stack gap={4}>
          <Title order={1}>Clima histórico</Title>
          <Text c='dimmed'>
            Consulta los datos climáticos históricos de cualquier población
            española
          </Text>
        </Stack>

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
          data={[]}
          limit={10}
        />

        <Button fullWidth size='md'>
          Buscar
        </Button>
      </Stack>
    </Container>
  );
}
