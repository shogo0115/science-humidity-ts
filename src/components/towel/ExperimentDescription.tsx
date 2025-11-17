import React from "react";

type ExperimentDescriptionProps = {
  initialTemperature: number;        // 実験開始時の室温
  initialVapor: number;              // 実験開始時の水蒸気量
  initialWater: number;     // 実験開始時に設定したコップの温度
  isExperimentRunning: boolean;      // 実験中フラグ
};

const ExperimentDescription: React.FC<ExperimentDescriptionProps> = ({
  initialTemperature,
  initialVapor,
  initialWater,
  isExperimentRunning,
}) => {
  return (
    <div className="experiment-description">
      <h2>蒸発のしくみ</h2>
      <p>
        飽和水蒸気量は温度によって決定し、飽和水蒸気量を上回る水分は蒸発しません。
      </p>

      <h3>実験内容</h3>
      <p>
        室温 {initialTemperature.toFixed(1)}℃、
        水蒸気量 {initialVapor.toFixed(1)} g/m³ 入っている1m³の密閉空間に
        あるタオルが水を {initialWater.toFixed(1)}g 含んでいるとき時間経過で乾くのかを観察する。
      </p>
    </div>
  );
};

export default ExperimentDescription;
