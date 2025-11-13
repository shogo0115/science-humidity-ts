export declare function satPress(T: number): number;
export declare function satVapor(T: number): number;
/** 0〜50℃を0.1刻みでテーブル化（飽和水蒸気量→温度） */
export declare function buildSaturationTable(): {
    temperature: number;
    saturationVapor: number;
}[];
export declare function temperatureFromSaturationVapor(sv: number, table: ReturnType<typeof buildSaturationTable>): number;
//# sourceMappingURL=humidityFormulas.d.ts.map