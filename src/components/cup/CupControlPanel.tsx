import React from "react";
import "./CupControlPanel.css";

interface CupControlPanelProps {
  temperature: number;
  saturationVapor: number;
  vapor: number;
  cupTemperature: number;
  waterDrop: number;
  remainingVapor: number;
  isExperimentRunning: boolean;
  setOriginalTemperature: (t: number) => void;
  setVapor: (v: number) => void;
  setCupTemperature: (ct: number) => void;
  toggleExperiment: () => void;
}

const CupControlPanel: React.FC<CupControlPanelProps> = ({
  temperature,
  vapor,
  cupTemperature,
  isExperimentRunning,
  setOriginalTemperature: setTemperature,
  setVapor,
  setCupTemperature,
  toggleExperiment
}) => {
  const isDisabled = isExperimentRunning;
  const buttonText = isExperimentRunning ? "実験を停止" : "実験開始";
  const buttonClass = `btn ${isExperimentRunning ? "btn-danger" : "btn-primary"}`;

  return (
    <div className="graph-panel">
      <h3>実験条件設定</h3>
      <div className="graph-row">
          <label>部屋の温度 [℃] ({temperature}℃)</label>
          <input
            type="range"
            min={20}
            max={40}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={20}
          max={40}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value || "20"))}
          />
      </div>

      <div className="graph-row">
          <label>空間内の水分量 [g/m³] ({vapor}g/m³)</label>
          <input
            type="range"
            min={4.9}
            max={51.1}
            step={0.1}
            value={vapor}
            onChange={(e) => setVapor(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={4.9}
          max={51.1}
          step={0.1}
          value={vapor}
          onChange={(e) => setVapor(parseFloat(e.target.value || "4.9"))}
          />
      </div>

      <div className="graph-row">
          <label>コップの温度 [℃] ({cupTemperature}℃)</label>
          <input
            type="range"
            min={0}
            max={20}
            step={0.1}
            value={cupTemperature}
            onChange={(e) => setCupTemperature(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={0}
          max={20}
          step={0.1}
          value={cupTemperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value || "0"))}
          />
      </div>

      <button onClick={toggleExperiment} className={buttonClass}>
        {buttonText}
      </button>
    </div>
  );
};

export default CupControlPanel;