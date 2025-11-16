import React from "react";
import "./currentHumidityDisplay.css";

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <div className="row-container">
      <label className="row-label">{label}</label>
      <div className="row-controls">{children}</div>
    </div>
  );
};

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

const CurrentHumidityDisplay: React.FC<CurrentHumidityDisplayProps> = ({
  temperature,
  saturationVapor,
  vapor,
  humidity,
  waterDrop,
  fixTemperature,
  fixVapor,
  setTemperature,
  setSaturationVapor,
  setVapor,
  setHumidity,
  toggleFixTemperature,
  toggleFixVapor,
  saveState,
}) => {
  // 親コンポーネントのロジックを反映した UI 制御
  const anyFixed = fixTemperature || fixVapor;
  const humidityEnabled = anyFixed;
  const isSaturationVaporAlert = saturationVapor >= 82.8;
  const isTemperatureAlert = temperature >= 50.0;

  return (
    <div className="graph-panel1">
      <h3>空間の状態</h3>

      <Row label="温度 [℃](0~50℃)">
        <input
          type="range"
          min={0}
          max={50}
          step={0.1}
          value={temperature}
          disabled={fixTemperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
        />
        <input
          type="number"
          min={0}
          max={50}
          step={0.1}
          value={temperature}
          disabled={fixTemperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value || "0"))}
          className={`input-compact ${isTemperatureAlert ? "text-alert" : ""}`}
        />
        <span>℃</span>
      </Row>

      <Row label="飽和水蒸気量 [g/m³](4.9~82.8g/m³)">
        <input
          type="range"
          min={4.9}
          max={82.8}
          step={0.1}
          value={saturationVapor}
          disabled={fixTemperature}
          onChange={(e) => setSaturationVapor(parseFloat(e.target.value))}
        />
        <input
          type="number"
          min={4.9}
          max={82.8}
          step={0.1}
          value={saturationVapor}
          disabled={fixTemperature}
          onChange={(e) => setSaturationVapor(parseFloat(e.target.value || "4.9"))}
          className={`input-compact ${isSaturationVaporAlert ? "text-alert" : ""}`}
        />
        <span>g/m³</span>
      </Row>

      <Row label="空間内の水分量 [g/m³](4.9~90.0g/m³)">
        <input
          type="range"
          min={4.9}
          max={90}
          step={0.1}
          value={vapor}
          disabled={fixVapor}
          onChange={(e) => setVapor(parseFloat(e.target.value))}
        />
        <input
          type="number"
          min={4.9}
          max={90}
          step={0.1}
          value={vapor}
          disabled={fixVapor}
          onChange={(e) => setVapor(parseFloat(e.target.value || "4.9"))}
          className="input-compact"
        />
        <span>g/m³</span>
      </Row>

      <Row label="湿度 [%](5.9~100%)">
        <input
          type="range"
          min={5.9}
          max={100}
          step={0.1}
          value={humidity}
          disabled={!humidityEnabled}
          onChange={(e) => setHumidity(parseFloat(e.target.value))}
        />
        <input
          type="number"
          min={5.9}
          max={100}
          step={0.1}
          value={humidity}
          disabled={!humidityEnabled}
          onChange={(e) => setHumidity(parseFloat(e.target.value || "5.9"))}
          className="input-compact"
        />
        <span>%</span>
      </Row>

      <Row label="水滴の量 [g/m³](0~85.1g/m³)">
        <input
          type="range"
          min={0}
          max={85.1}
          step={0.1}
          value={waterDrop}
          disabled
          readOnly
        />
        <input
          type="number"
          min={0}
          max={85.1}
          step={0.1}
          value={waterDrop}
          disabled
          readOnly
          className="input-compact"
        />
        <span>g/m³</span>
      </Row>

      <div className="btn-group">
        <button
          onClick={toggleFixTemperature}
          className={`btn ${fixTemperature ? "active" : ""}`}
        >
          {fixTemperature ? "温度を固定中" : "温度を固定"}
        </button>
        <button
          onClick={toggleFixVapor}
          className={`btn ${fixVapor ? "active" : ""}`}
        >
          {fixVapor ? "水分量を固定中" : "水分量を固定"}
        </button>
        <button onClick={saveState} className="btn">
          初めの空間の状態として保存
        </button>
      </div>
    </div>
  );
};

export default CurrentHumidityDisplay;