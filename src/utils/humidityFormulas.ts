export function satPress(T: number) {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}

export function satVapor(T: number) {
    return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

/** 0〜50℃を0.1刻みでテーブル化（飽和水蒸気量→温度） */
export function buildSaturationTable() {
  const table: { temperature: number; saturationVapor: number }[] = [];
  for (let T = 0; T <= 50.1; T += 0.1) {
    const t = parseFloat(T.toFixed(1));
    table.push({ temperature: t, saturationVapor: satVapor(t) });
  }
  return table;
}
export function temperatureFromSaturationVapor(
  sv: number,
  table: ReturnType<typeof buildSaturationTable>
) {
  const exact = table.find((x) => x.saturationVapor === sv);
  if (exact) return exact.temperature;
  let bestT = table[0]?.temperature ?? 0;
  let bestDiff = Infinity;
  for (const row of table) {
    const d = Math.abs(row.saturationVapor - sv);
    if (d < bestDiff) {
      bestDiff = d;
      bestT = row.temperature;
    }
  }
  return bestT;
}