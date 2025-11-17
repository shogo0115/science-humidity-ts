import React from 'react';
export declare function satPress(T: number): number;
export declare function satVapor(T: number): number;
interface HumidityGraphCanvasMiniProps {
    temp: number;
    saturationVapor: number;
    vapor: number;
    waterDrop: number;
    remainingVapor: number;
    xAxisLabel: string;
    yAxisLabel: string;
}
declare const HumidityGraphCanvasMini: React.FC<HumidityGraphCanvasMiniProps>;
export default HumidityGraphCanvasMini;
//# sourceMappingURL=HumidityGraphCanvasMini.d.ts.map