import React from "react";

type ExperimentDescriptionProps = {
  initialTemperature: number;        // 実験開始時の室温
  initialVapor: number;              // 実験開始時の水蒸気量
  initialCupTemperature: number;     // 実験開始時に設定したコップの温度
  isExperimentRunning: boolean;      // 実験中フラグ
};

const ExperimentDescription: React.FC<ExperimentDescriptionProps> = ({
  initialTemperature,
  initialVapor,
  initialCupTemperature,
  isExperimentRunning,
}) => {
  return (
    <div className="experiment-description">
      <h2>結露のしくみ</h2>
      <p>
        室内の暖かい空気が冷たい窓に触れ、水蒸気量が飽和水蒸気量を超えることで、
        水滴が発生します。 そのため水滴は窓の内側に発生します。
      </p>

      <h3>実験内容</h3>
      <p>
        室温 {initialTemperature.toFixed(1)}℃、
        空間内の水分量 {initialVapor.toFixed(1)} g/m³ の部屋があり
        外の気温が {initialCupTemperature.toFixed(1)}℃ の時の窓の様子を観察する。
      </p>
    </div>
  );
};

export default ExperimentDescription;
