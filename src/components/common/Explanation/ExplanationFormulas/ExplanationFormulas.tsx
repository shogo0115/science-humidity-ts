import React from "react";

const ExplanationFormulas: React.FC = () => {
  return (
    <div>
      <h3>公式</h3>
      <p>
        湿度 [%] = (<span style={{ color: "blue" }}>水蒸気量</span> /{" "}
        <span style={{ color: "red" }}>飽和水蒸気量</span>) × 100
      </p>
      <p>
        <span style={{ color: "green" }}>水滴の量</span> [g/m³] = 空間内の水分量 -{" "}
        <span style={{ color: "red" }}>飽和水蒸気量</span>
      </p>
      <p>
        空間内の水分量 [g/m³] = <span style={{ color: "blue" }}>水蒸気量</span> +{" "}
        <span style={{ color: "green" }}>水滴の量</span>
      </p>
      <p style={{ color: "red", fontWeight: "bold" }}>
        注意事項: スライダーはゆっくり動かして下さい。結果と異なる数値が表示される場合があります。温度が50℃以上、飽和水蒸気量が82.8g/m3以上となる場合は数値が赤色に変化します。
      </p>
    </div>
  );
};

export default ExplanationFormulas;