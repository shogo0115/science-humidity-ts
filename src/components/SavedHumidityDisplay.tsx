import React from "react";

/**
 * ヘルパーコンポーネント: 読み取り専用の値を整形して表示する行
 * (Graph.tsx からの移動を想定)
 */
const ReadRow: React.FC<{ label: string; value: number; unit: string }> = ({
  label,
  value,
  unit,
}) => (
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
      <input
        type="number"
        value={value.toFixed(1)} // 小数点以下1桁に整形して表示
        readOnly
        style={{ width: 70 }}
      />
      <span>{unit}</span>
    </div>
  </div>
);

// --- SavedHumidityDisplay コンポーネント本体 ---

interface SavedHumidityDisplayProps {
  // 保存された状態（スナップショット）の値
  temperature2: number;
  saturationVapor2: number; // 飽和水蒸気量も表示用に必要
  vapor2: number;
  humidity2: number;
  condensed2: number;
}

/**
 * ユーザーが保存した「初めの空間の状態」を読み取り専用で表示するコンポーネント
 */
const SavedHumidityDisplay: React.FC<SavedHumidityDisplayProps> = ({
  temperature2,
  saturationVapor2,
  vapor2,
  humidity2,
  condensed2,
}) => {
  return (
    <div className="graph-panel">
      <h3>初めの空間の状態</h3>

      {/* 読み取り専用の行を使用して値を表示 */}
      <ReadRow label="温度 [℃]" value={temperature2} unit="℃" />
      <ReadRow label="飽和水蒸気量 [g/m³]" value={saturationVapor2} unit="g/m³" />
      <ReadRow label="空間内の水分量 [g/m³]" value={vapor2} unit="g/m³" />
      <ReadRow label="湿度 [%]" value={humidity2} unit="%" />
      <ReadRow label="水滴の量 [g/m³]" value={condensed2} unit="g/m³" />
    </div>
  );
};

export default SavedHumidityDisplay;