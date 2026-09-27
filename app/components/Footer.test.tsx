import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

function renderFooter() {
  return render(
    <MantineProvider>
      <Footer />
    </MantineProvider>,
  );
}

describe('Footer', () => {
  it('attributes the data to AEMET', () => {
    renderFooter();

    expect(
      screen.getByText('Datos obtenidos de AEMET — Agencia Estatal de Meteorología'),
    ).toBeInTheDocument();
  });
});
