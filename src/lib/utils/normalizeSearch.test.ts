import { describe, it, expect } from 'vitest';
import { normalizeSearch } from './normalizeSearch';

const matches = (query: string, target: string): boolean =>
  normalizeSearch(target).includes(normalizeSearch(query));

describe('normalizeSearch', () => {
  it('remove acentos e converte para minúsculas', () => {
    expect(normalizeSearch('Árbore SDR')).toBe('arbore sdr');
    expect(normalizeSearch('ÁRBORE')).toBe('arbore');
  });

  it('colapsa espaços repetidos e apara as bordas', () => {
    expect(normalizeSearch(' árbore  sdr ')).toBe('arbore sdr');
    expect(normalizeSearch('a\t\n b')).toBe('a b');
  });

  it('trata strings já decompostas (NFD) igual às compostas (NFC)', () => {
    expect(normalizeSearch('Árbore')).toBe(normalizeSearch('Árbore'));
  });

  it('retorna string vazia para entrada só com espaços', () => {
    expect(normalizeSearch('   ')).toBe('');
  });

  it.each([
    ['arbore', 'Árbore SDR'],
    ['ÁRBORE', 'Árbore SDR'],
    [' árbore  sdr ', 'Árbore SDR'],
    ['arbore sdr', 'Árbore  SDR'],
  ])('"%s" encontra "%s"', (query, target) => {
    expect(matches(query, target)).toBe(true);
  });

  it('não encontra quando o termo não existe', () => {
    expect(matches('xpto', 'Árbore SDR')).toBe(false);
    expect(matches('arvore', 'Árbore SDR')).toBe(false);
  });
});
