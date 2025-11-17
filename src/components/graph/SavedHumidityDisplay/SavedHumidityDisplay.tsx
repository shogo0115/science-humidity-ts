import React from "react";
import "./savedHumidityDisplay.css";

interface ReadRowProps {
  label: string;
  value: number;
  unit: string;
}

const ReadRow: React.FC<ReadRowProps> = ({
  label,
  value,
  unit,
}) => (
  <div className="read-row-container">
    <label className="read-row-label">{label}</label>
    <div className="read-row-value-group">
      <input
        type="number"
        value={value.toFixed(1)}
        readOnly
        className="read-row-input-compact"
      />
      <span>{unit}</span>
    </div>
  </div>
);

interface SavedHumidityDisplayProps {
  temperature2: number;
  saturationVapor2: number;
  vapor2: number;
  humidity2: number;
  waterDrop2: number;
}

const SavedHumidityDisplay: React.FC<SavedHumidityDisplayProps> = ({
  temperature2,
  saturationVapor2,
  vapor2,
  humidity2,
  waterDrop2,
}) => {
  return (
    <div className="graph-panel2">
      <h3 style={{ fontWeight: 'bold' }}>初めの空間の状態</h3>
      <ReadRow label="温度 [℃]" value={temperature2} unit="℃" />
      <ReadRow label="飽和水蒸気量 [g/m³]" value={saturationVapor2} unit="g/m³" />
      <ReadRow label="空間内の水分量 [g/m³]" value={vapor2} unit="g/m³" />
      <ReadRow label="湿度 [%]" value={humidity2} unit="%" />
      <ReadRow label="水滴の量 [g/m³]" value={waterDrop2} unit="g/m³" />
    </div>
  );
};

export default SavedHumidityDisplay;