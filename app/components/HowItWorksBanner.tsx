import { Alert, Box } from '@mantine/core';

export function HowItWorksBanner() {
  return (
    <Box w={{ base: '90%', md: '30%' }} mx="auto" mb="lg">
      <Alert color="blue" title="Cómo funciona">
        Selecciona una estación meteorológica, indica el periodo de meses que quieres consultar y,
        opcionalmente, introduce el número de años para compararlo con el mismo periodo del pasado.
      </Alert>
    </Box>
  );
}
