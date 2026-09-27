import { Alert, Box } from '@mantine/core';

export function MissingDataInfo() {
  return (
    <Box mt="xl" w={{ base: '90%', md: '80%' }} mx="auto">
      <Alert color="gray" title="¿Por qué no veo datos?">
        No todas las estaciones de AEMET disponen de datos históricos completos. Si no aparecen
        datos para el periodo seleccionado, prueba con otra estación o con un rango de meses
        diferente.
      </Alert>
    </Box>
  );
}
