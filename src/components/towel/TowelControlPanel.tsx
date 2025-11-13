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

const TowelControlPanel: React.FC<TowelControlPanelProps> = ({
  temperature,
  vapor,
  cupTemperature,
  isExperimentRunning,
  water,
  setTemperature,
  setVapor,
  setWater,
  toggleExperiment
}) => {
  const isDisabled = isExperimentRunning;
  const buttonText = isExperimentRunning ? "実験を停止" : "実験開始";
  const buttonClass = `btn ${isExperimentRunning ? "btn-danger" : "btn-primary"}`;

  return (
    <div className="graph-panel">
      <h3>実験条件設定</h3>
      <div className="graph-row">
          <label>温度[℃] ({temperature}℃)</label>
          <input
            type="range"
            min={10}
            max={35}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={10}
          max={35}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value || "10"))}
          />
      </div>

      <div className="graph-row">
          <label>水蒸気量 [g/m³] ({vapor}g/m³)</label>
          <input
            type="range"
            min={5}
            max={9.4}
            step={0.1}
            value={vapor}
            onChange={(e) => setVapor(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={5}
          max={9.4}
          step={0.1}
          value={vapor}
          onChange={(e) => setVapor(parseFloat(e.target.value || "5"))}
          />
      </div>

      <div className="graph-row">
          <label>タオルに含む水分量 [g] ({water}g)</label>
          <input
            type="range"
            min={0}
            max={30}
            step={0.1}
            value={water}
            onChange={(e) => setWater(parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <input
          type="number"
          min={0}
          max={30}
          step={0.1}
          value={water}
          onChange={(e) => setWater(parseFloat(e.target.value || "0"))}
          />
      </div>

      <button onClick={toggleExperiment} className={buttonClass}>
        {buttonText}
      </button>
    </div>
  );
};

export default TowelControlPanel;