import React from 'react';
import "./savedHumidityDisplay.css";
export declare function satPress(T: number): number;
export declare function satVapor(T: number): number;
interface HumidityGraphCanvasProps {
    temperature: number;
    saturationVapor: number;
    vapor: number;
    waterDrop: number;
    remainingVapor: number;
    temperature2: number;
    saturationVapor2: number;
    vapor2: number;
    waterDrop2: number;
    remainingVapor2: number;
}
declare const HumidityGraphCanvas: React.FC<HumidityGraphCanvasProps>;
export default HumidityGraphCanvas;
//# sourceMappingURL=HumidityGraphCanvas.d.ts.map