import { describe, expect, it } from 'vitest';

import { normalize } from './normalize';

describe('normalize', () => {
  it('strips accents', () => {
    expect(normalize('ÁVILA')).toBe('avila');
  });

  it('trims surrounding whitespace', () => {
    expect(normalize('  Avila  ')).toBe('avila');
  });

  it('lowercases uppercase input', () => {
    expect(normalize('MADRID')).toBe('madrid');
  });

  it('leaves already-normalized input unchanged', () => {
    expect(normalize('madrid')).toBe('madrid');
  });

  it('handles accented, mixed-case and padded input together', () => {
    expect(normalize('  MaDrId ')).toBe('madrid');
  });
});
