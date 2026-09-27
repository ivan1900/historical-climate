import { expect, test, type Page } from '@playwright/test';

const LOADING_TEXT = 'Obteniendo datos históricos de AEMET…';

async function selectPeriod(page: Page) {
  await page.getByLabel('Periodo').click();

  // Navigate to a fixed year so the selected period is deterministic.
  await page.locator('.mantine-MonthPickerInput-calendarHeaderLevel').click();
  await page.locator('.mantine-MonthPickerInput-yearsListControl', { hasText: /^2020$/ }).click();
  await page.locator('.mantine-MonthPickerInput-monthsListControl', { hasText: /^Jan$/ }).click();
  await page.locator('.mantine-MonthPickerInput-monthsListControl', { hasText: /^Jun$/ }).click();

  await expect(page.getByText('Rango seleccionado: 2020-01 – 2020-06')).toBeVisible();
}

async function selectStation(page: Page, query = 'Madrid') {
  await page.getByPlaceholder('Busca una estación (ej. Madrid)').fill(query);

  const option = page.getByRole('option').first();
  await expect(option).toBeVisible();
  await option.click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows the search form with its Spanish labels', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Clima histórico' })).toBeVisible();
  await expect(page.getByText('Periodo', { exact: true })).toBeVisible();
  await expect(page.getByText('Estación', { exact: true })).toBeVisible();
  await expect(page.getByText('Comparar con años atrás', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
});

test('typing a station name shows autocomplete suggestions', async ({ page }) => {
  const input = page.getByPlaceholder('Busca una estación (ej. Madrid)');
  await input.fill('Madrid');

  const option = page.getByRole('option').first();
  await expect(option).toBeVisible();
  await expect(option).toContainText(/madrid/i);
});

test('the month range picker opens and a period can be selected', async ({ page }) => {
  await selectPeriod(page);
});

test('searching a station and period shows the loading message and then the chart', async ({
  page,
}) => {
  await selectStation(page);
  await selectPeriod(page);

  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText(LOADING_TEXT)).toBeVisible();
  await expect(page.getByText('Temperatura media', { exact: true })).toBeVisible({
    timeout: 60_000,
  });
});
