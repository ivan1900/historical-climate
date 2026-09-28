import { Box, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

function StationIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PeriodIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function ComparisonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 4l4 4-4 4" />
      <path d="M21 8H8" />
      <path d="M7 20l-4-4 4-4" />
      <path d="M3 16h13" />
    </svg>
  );
}

function Step({
  number,
  icon,
  children,
  withDivider,
}: {
  number: number;
  icon: ReactNode;
  children: ReactNode;
  withDivider?: boolean;
}) {
  return (
    <Group
      gap="md"
      align="flex-start"
      wrap="nowrap"
      style={
        withDivider
          ? {
              borderBottom: '1px solid var(--mantine-color-default-border)',
              paddingBottom: 'var(--mantine-spacing-md)',
            }
          : undefined
      }
    >
      <Group gap="xs" wrap="nowrap">
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mantine-color-blue-filled)',
            backgroundColor: 'var(--mantine-color-blue-light)',
          }}
        >
          {icon}
        </Box>
        <Text
          fw={700}
          ta="center"
          style={{
            width: 22,
            height: 22,
            lineHeight: '22px',
            fontSize: 'var(--mantine-font-size-xs)',
            borderRadius: '50%',
            color: 'var(--mantine-color-white)',
            backgroundColor: 'var(--mantine-color-blue-filled)',
          }}
        >
          {number}
        </Text>
      </Group>
      <Text size="sm" style={{ flex: 1 }}>
        {children}
      </Text>
    </Group>
  );
}

export function HowItWorksBanner() {
  return (
    <Box w={{ base: '90%', md: '30%' }} mx="auto" mb="lg">
      <Stack
        gap="md"
        p="md"
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Title order={3} ta="center" mb="xs" c="blue">
          Cómo funciona
        </Title>
        <Step number={1} icon={<StationIcon />} withDivider>
          Selecciona una estación meteorológica
        </Step>
        <Step number={2} icon={<PeriodIcon />} withDivider>
          Indica el periodo de meses que quieres consultar
        </Step>
        <Step number={3} icon={<ComparisonIcon />}>
          Introduce el número de años para comparar con el mismo periodo del pasado (opcional)
        </Step>
      </Stack>
    </Box>
  );
}
