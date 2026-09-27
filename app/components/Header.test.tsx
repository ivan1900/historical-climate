import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Header } from './Header';

function renderHeader() {
  return render(
    <MantineProvider>
      <Header />
    </MantineProvider>,
  );
}

describe('Header', () => {
  it('renders the site title and subtitle', () => {
    renderHeader();

    expect(screen.getByRole('heading', { name: 'Clima histórico de España' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Visualiza y compara la evolución del clima en cualquier estación meteorológica española.',
      ),
    ).toBeInTheDocument();
  });
});
