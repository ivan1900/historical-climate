'use client';

import { Box, Button, Collapse, Group, List, Stack, Text } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

type MissingDataInfoProps = {
  // When a search has just returned no data the info is promoted from a
  // discreet collapsible to a full card with actionable tips: the user is
  // most likely staring at an empty chart and wondering why.
  noResults?: boolean;
};

const cardStyle: CSSProperties = {
  border: '1px solid var(--mantine-color-default-border)',
  borderRadius: 'var(--mantine-radius-md)',
};

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

function HelpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 1-1 1.7" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

function StationIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PeriodIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ClockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <Box
      component="span"
      style={{
        display: 'inline-flex',
        transition: 'transform 150ms ease',
        transform: expanded ? 'rotate(180deg)' : 'none',
      }}
    >
      <svg width={16} height={16} {...iconProps}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </Box>
  );
}

function IconBadge({
  children,
  size = 28,
  tone = 'blue',
}: {
  children: ReactNode;
  size?: number;
  tone?: 'blue' | 'gray';
}) {
  return (
    <Box
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: `var(--mantine-color-${tone}-filled)`,
        backgroundColor: `var(--mantine-color-${tone}-light)`,
      }}
    >
      {children}
    </Box>
  );
}

const TIPS: { icon: ReactNode; text: string }[] = [
  {
    icon: <StationIcon />,
    text: 'Prueba con otra estación cercana: suelen cubrir periodos distintos.',
  },
  {
    icon: <PeriodIcon />,
    text: 'Cambia el rango de meses: acórtalo o consulta un periodo diferente.',
  },
  {
    icon: <ClockIcon />,
    text: 'Muchas estaciones empezaron a registrar hace pocos años; si comparas con el pasado, puede que no existan datos.',
  },
];

const EXPLANATION = 'No todas las estaciones de AEMET disponen de datos históricos completos.';

function MissingDataCard() {
  return (
    <Stack gap="md" p="md" style={cardStyle}>
      <Group gap="sm" wrap="nowrap">
        <IconBadge size={32}>
          <HelpIcon size={18} />
        </IconBadge>
        <Box>
          <Text fw={600} size="sm">
            ¿Por qué no veo datos?
          </Text>
          <Text size="xs" c="dimmed">
            {EXPLANATION}
          </Text>
        </Box>
      </Group>
      <Stack gap="sm">
        {TIPS.map((tip) => (
          <Group key={tip.text} gap="sm" align="flex-start" wrap="nowrap">
            <IconBadge>{tip.icon}</IconBadge>
            <Text size="sm" style={{ flex: 1 }}>
              {tip.text}
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}

function MissingDataCollapsible() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Button
        variant="subtle"
        color="gray"
        size="sm"
        fullWidth
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        styles={{ inner: { width: '100%', justifyContent: 'space-between' } }}
        leftSection={
          <IconBadge tone="gray" size={22}>
            <Text fw={700} size="xs">
              ?
            </Text>
          </IconBadge>
        }
        rightSection={<ChevronIcon expanded={expanded} />}
      >
        ¿Por qué no veo datos?
      </Button>

      <Collapse expanded={expanded}>
        <Stack gap="xs" p="md" mt="xs" style={cardStyle}>
          <Text size="sm" c="dimmed">
            {EXPLANATION}
          </Text>
          <List size="sm">
            {TIPS.map((tip) => (
              <List.Item key={tip.text}>{tip.text}</List.Item>
            ))}
          </List>
        </Stack>
      </Collapse>
    </>
  );
}

export function MissingDataInfo({ noResults = false }: MissingDataInfoProps) {
  return (
    <Box component="section" w={{ base: '90%', md: '30%' }} mx="auto" mt="xl">
      {noResults ? <MissingDataCard /> : <MissingDataCollapsible />}
    </Box>
  );
}
