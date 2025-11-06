import React from "react";
// Row コンポーネントの定義をこのファイルに含めるか、共通ファイルからインポートしてください。

// (元のコードから移動を想定した Row コンポーネントの再掲)
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <label style={{ minWidth: 200 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {children}
      </div>
    </div>
  );
};
// --- Row ここまで ---

interface CurrentHumidityDisplayProps {
  // --- データ (親から渡される状態) ---
  temperature: number;
  saturationVapor: number;
  vapor: number;
  humidity: number;
  condensed: number;
  fixTemperature: boolean;
  fixVapor: boolean;

  // --- 関数 (親から渡されるロジック) ---
  setTemperature: (t: number) => void;
  updateTemperatureFromSV: (sv: number) => void;
  setVapor: (v: number) => void;
  setHumidity: (h: number) => void;
  toggleFixTemperature: () => void;
  toggleFixVapor: () => void;
  saveState: () => void;
}

/**
 * 空間の現在の状態を操作するためのコントロールパネル
 */
const CurrentHumidityDisplay: React.FC<CurrentHumidityDisplayProps> = ({
  temperature,
  saturationVapor,
  vapor,
  humidity,
  condensed,
  fixTemperature,
  fixVapor,
  setTemperature,
  updateTemperatureFromSV,
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

  return (
    <div className="graph-panel">
      <h3>空間の状態</h3>

      {/* 1. 温度 */}
      <Row label="温度 [℃]">
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
          className={`input-compact ${saturationVapor > 82.8 ? "text-alert" : ""}`}
        />
        <span>℃</span>
      </Row>

      {/* 2. 飽和水蒸気量 */}
      <Row label="飽和水蒸気量 [g/m³]">
        <input
          type="range"
          min={4.9}
          max={82.8}
          step={0.1}
          value={saturationVapor}
          disabled={fixTemperature}
          onChange={(e) => updateTemperatureFromSV(parseFloat(e.target.value))}
        />
        <input
          type="number"
          min={4.9}
          max={82.8}
          step={0.1}
          value={saturationVapor}
          disabled={fixTemperature}
          onChange={(e) => updateTemperatureFromSV(parseFloat(e.target.value || "4.9"))}
          className={`input-compact ${isSaturationVaporAlert ? "text-alert" : ""}`}
        />
        <span>g/m³</span>
      </Row>

      {/* 3. 空間内の水分量 */}
      <Row label="空間内の水分量 [g/m³]">
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

      {/* 4. 湿度 */}
      <Row label="湿度 [%]">
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

      {/* 5. 水滴の量（読み取り専用） */}
      <Row label="水滴の量 [g/m³]">
        <input
          type="range"
          min={0}
          max={85.1}
          step={0.1}
          value={condensed}
          disabled
          readOnly
        />
        <input
          type="number"
          min={0}
          max={85.1}
          step={0.1}
          value={condensed}
          disabled
          readOnly
          className="input-compact"
        />
        <span>g/m³</span>
      </Row>

      {/* 6. モード切替＆保存ボタン */}
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