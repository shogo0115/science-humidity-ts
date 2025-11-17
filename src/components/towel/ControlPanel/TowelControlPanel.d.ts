import React from "react";
import "../../common/Explanation/ControlPanel/experimentControlPanel.css";
interface TowelControlPanelProps {
    originTemp: number;
    vapor: number;
    towelWater: number;
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