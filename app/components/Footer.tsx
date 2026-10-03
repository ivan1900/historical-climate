import { Box, Container, Text } from '@mantine/core';

export function Footer() {
  return (
    <Box
      component="footer"
      py="md"
      px={{ base: 'md', md: 'xl' }}
      ta="center"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      <Container size="lg">
        <Text size="sm" c="dimmed">
          Datos obtenidos de AEMET — Agencia Estatal de Meteorología
        </Text>
        <Text size="xs" c="dimmed">
          Proyecto personal de divulgación. No es un estudio científico ni pretende serlo.
        </Text>
      </Container>
    </Box>
  );
}
