import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HowItWorksBanner } from './HowItWorksBanner';

function renderBanner() {
  return render(
    <MantineProvider>
      <HowItWorksBanner />
    </MantineProvider>,
  );
}

describe('HowItWorksBanner', () => {
  it('renders the three usage steps', () => {
    renderBanner();

    expect(screen.getByRole('heading', { name: 'Cómo funciona' })).toBeInTheDocument();
    expect(screen.getByText('Selecciona una estación meteorológica')).toBeInTheDocument();
    expect(
      screen.getByText('Indica el periodo de meses que quieres consultar'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Introduce el número de años para comparar con el mismo periodo del pasado (opcional)',
      ),
    ).toBeInTheDocument();
  });

  it('renders the not-a-scientific-study disclaimer', () => {
    renderBanner();

    expect(
      screen.getByText(
        'Esta es una herramienta de divulgación personal. Los datos se muestran tal cual los publica AEMET, sin validación ni tratamiento adicional. No es un estudio científico ni pretende serlo.',
      ),
    ).toBeInTheDocument();
  });
});
