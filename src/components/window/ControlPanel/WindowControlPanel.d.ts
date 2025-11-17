import React from "react";
interface WindowControlPanelProps {
    originTemp: number;
    vapor: number;
    tergetTemp: number;
    isExperimentRunning: boolean;
    setOriginTemp: (t: number) => void;
    setVapor: (v: number) => void;
    setTergetTemp: (ct: number) => void;
    toggleExperiment: () => void;
}
declare const WindowControlPanel: React.FC<WindowControlPanelProps>;
export default WindowControlPanel;
//# sourceMappingURL=WindowControlPanel.d.ts.map