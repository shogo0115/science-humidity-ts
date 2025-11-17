import React from "react";
import "./currentHumidityDisplay.css";
interface CurrentHumidityDisplayProps {
    temperature: number;
    saturationVapor: number;
    vapor: number;
    humidity: number;
    waterDrop: number;
    fixTemperature: boolean;
    fixVapor: boolean;
    setTemperature: (t: number) => void;
    setSaturationVapor: (sv: number) => void;
    setVapor: (v: number) => void;
    setHumidity: (h: number) => void;
    toggleFixTemperature: () => void;
    toggleFixVapor: () => void;
    saveState: () => void;
}
declare const CurrentHumidityDisplay: React.FC<CurrentHumidityDisplayProps>;
export default CurrentHumidityDisplay;
//# sourceMappingURL=CurrentHumidityDisplay.d.ts.map