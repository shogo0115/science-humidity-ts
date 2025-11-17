import React from "react";

type ExperimentDescriptionProps = {
  initialOriginalTemperature: number;
  initialVapor: number;
  initialCupTemperature: number;
  isExperimentRunning: boolean;
};

const ExperimentDescription: React.FC<ExperimentDescriptionProps> = ({
  initialOriginalTemperature: initialTemperature,
  initialVapor,
  initialCupTemperature,
  isExperimentRunning,
}) => {
  return (
    <div className="experiment-description">
      <h2>結露のしくみ</h2>
      <p>
        空気中に含まれる水蒸気がコップの冷たい縁に触れると、その部分の空気が冷やされ、
        飽和水蒸気量を超えた水蒸気が凝縮して水滴として現れます。
      </p>

      <h2>実験内容</h2>
      <p>
        室温 {initialTemperature.toFixed(1)}℃、
        空間内の水分量 {initialVapor.toFixed(1)} g/m³ の部屋にある
        コップを、ゆっくり {initialCupTemperature.toFixed(1)}℃ まで冷ましていきます。
      </p>
    </div>
  );
};

export default ExperimentDescription;
