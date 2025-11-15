import React from "react";
interface WindowControlPanelProps {
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
declare const WindowControlPanel: React.FC<WindowControlPanelProps>;
export default WindowControlPanel;
//# sourceMappingURL=WindowControlPanel.d.ts.map