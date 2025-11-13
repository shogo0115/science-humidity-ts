import React from "react";
interface CupControlPanelProps {
    temperature: number;
    saturationVapor: number;
    vapor: number;
    cupTemperature: number;
    waterDrop: number;
    remainingVapor: number;
    isExperimentRunning: boolean;
    setTemperature: (t: number) => void;
    setVapor: (v: number) => void;
    setCupTemperature: (ct: number) => void;
    toggleExperiment: () => void;
}
declare const CupControlPanel: React.FC<CupControlPanelProps>;
export default CupControlPanel;
//# sourceMappingURL=CupControlPanel.d.ts.map