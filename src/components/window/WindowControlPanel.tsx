import React from "react";
import "../common/experimentControlPanel.css";

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

const WindowControlPanel: React.FC<WindowControlPanelProps> = ({
  originTemp,
  vapor,
  tergetTemp,
  isExperimentRunning,
  setOriginTemp,
  setVapor,
  setTergetTemp,
  toggleExperiment
}) => {
  const isDisabled = isExperimentRunning;
  const buttonText = isExperimentRunning ? "実験を停止" : "実験開始";
  const buttonClass = `experiment-button ${isExperimentRunning ? "btn-danger" : "btn-primary"}`;

  return (
    <div className="graph-panel">
      <h3>実験条件設定</h3>
      <div className="graph-row">
          <label>室温 (窓のまわりの温度)  [℃] ({originTemp}℃)</label>
          <input
            type="range"
            min={14}
            max={25}
            step={0.1}
            value={originTemp}
            onChange={(e) => setOriginTemp(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={14}
          max={25}
          step={0.1}
          value={originTemp}
          onChange={(e) => setOriginTemp(parseFloat(e.target.value || "14"))}
          />
      </div>

      <div className="graph-row">
          <label>空間内の水分量 [g/m³] ({vapor}g/m³)</label>
          <input
            type="range"
            min={5}
            max={40}
            step={0.1}
            value={vapor}
            onChange={(e) => setVapor(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={5}
          max={40}
          step={0.1}
          value={vapor}
          onChange={(e) => setVapor(parseFloat(e.target.value || "5"))}
          />
      </div>

      <div className="graph-row">
          <label>外の気温 [℃] ({tergetTemp}℃)</label>
          <input
            type="range"
            min={0}
            max={14}
            step={0.1}
            value={tergetTemp}
            onChange={(e) => setTergetTemp(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={0}
          max={14}
          step={0.1}
          value={tergetTemp}
          onChange={(e) => setOriginTemp(parseFloat(e.target.value || "0"))}
          />
      </div>

      <button onClick={toggleExperiment} className={buttonClass}>
        {buttonText}
      </button>
    </div>
  );
};

export default WindowControlPanel;