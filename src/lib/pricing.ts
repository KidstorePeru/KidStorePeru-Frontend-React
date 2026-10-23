/**
 * Shop price list: what a gift costs the customer in soles (S/), derived from
 * its V-Bucks (pavos) price. Every 100 pavos cost S/ 1.30.
 *
 * To change the rate, edit RATE_SOLES_PER_100_PAVOS below, or set
 * VITE_SOLES_PER_100_PAVOS as a build variable (e.g. 1.5) without touching code.
 */
const DEFAULT_SOLES_PER_100_PAVOS = 1.3;

const fromEnv = Number(import.meta.env?.VITE_SOLES_PER_100_PAVOS);
export const RATE_SOLES_PER_100_PAVOS =
  Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_SOLES_PER_100_PAVOS;

// Money is handled in whole céntimos so sums never drift by floating point.
const CENTS_PER_100_PAVOS = Math.round(RATE_SOLES_PER_100_PAVOS * 100);

/** Price in céntimos (an integer) of `pavos` V-Bucks, rounded to the nearest céntimo. */
export function pavosToCents(pavos: number): number {
  if (!Number.isFinite(pavos) || pavos <= 0) return 0;
  return Math.round((pavos * CENTS_PER_100_PAVOS) / 100);
}

/** Price in soles of `pavos` V-Bucks, e.g. 500 pavos -> 6.5. */
export function pavosToSoles(pavos: number): number {
  return pavosToCents(pavos) / 100;
}

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats an amount given in céntimos, e.g. 650 -> "S/ 6.50". */
export function formatCents(cents: number): string {
  return currency.format(cents / 100);
}

/** Formats the price of `pavos` V-Bucks, e.g. 500 -> "S/ 6.50". */
export function formatSoles(pavos: number): string {
  return formatCents(pavosToCents(pavos));
}

/** Human-readable rate for tooltips: "S/ 1.30 por cada 100 pavos". */
export const RATE_LABEL = `${currency.format(RATE_SOLES_PER_100_PAVOS)} por cada 100 pavos`;
