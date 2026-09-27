import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from './page';

// The home page only delegates to SearchSection, which imports the server
// actions. Mock them so this delegation test does not pull the Prisma client
// into its module graph.
vi.mock('./server/application/searchStations', () => ({
  searchStations: vi.fn(),
}));
vi.mock('./server/application/searchByDate', () => ({ default: vi.fn() }));
vi.mock('./server/application/searchByDateWithComparison', () => ({
  default: vi.fn(),
}));

describe('Home', () => {
  it('renders the search section', () => {
    render(
      <MantineProvider>
        <Home />
      </MantineProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Clima histórico' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });
});
