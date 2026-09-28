import { Box, Container, Stack, Text, Title } from '@mantine/core';

export function Header() {
  return (
    <Box
      component="header"
      py="md"
      px={{ base: 'md', md: 'xl' }}
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Container size="lg">
        <Stack gap={4} ta="center">
          <Title order={1}>Clima histórico de España</Title>
          <Text c="dimmed" size="sm">
            Visualiza y compara la evolución del clima en cualquier estación meteorológica española.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
