import React from "react";
import "../../common/Explanation/ControlPanel/experimentControlPanel.css";
interface CupControlPanelProps {
    originTemp: number;
    vapor: number;
    tergetTemp: number;
    isExperimentRunning: boolean;
    setOriginTemp: (t: number) => void;
    setVapor: (v: number) => void;
    setTergetTemp: (ct: number) => void;
    toggleExperiment: () => void;
}
declare const CupControlPanel: React.FC<CupControlPanelProps>;
export default CupControlPanel;
//# sourceMappingURL=CupControlPanel.d.ts.map