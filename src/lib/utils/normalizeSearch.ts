/**
 * Normaliza um texto para comparação de busca: remove acentos/diacríticos,
 * converte para minúsculas, colapsa espaços repetidos e apara as bordas.
 *
 * Ex.: `" ÁRBORE  sdr "` → `"arbore sdr"`.
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
