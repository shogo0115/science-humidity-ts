import React from "react";
interface TowelControlPanelProps {
    temperature: number;
    saturationVapor: number;
    vapor: number;
    cupTemperature: number;
    water: number;
    remainingVapor: number;
    isExperimentRunning: boolean;
    setTemperature: (t: number) => void;
    setVapor: (v: number) => void;
    setCupTemperature: (ct: number) => void;
    setWater: (w: number) => void;
    toggleExperiment: () => void;
}
declare const TowelControlPanel: React.FC<TowelControlPanelProps>;
export default TowelControlPanel;
//# sourceMappingURL=TowelControlPanel.d.ts.map