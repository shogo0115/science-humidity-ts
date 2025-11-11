import React from "react";

const ExplanationBarGraph: React.FC = () => {
  return (
    <div>
      <h3>棒グラフの色の説明</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 20, height: 20, background: "blue" }} />
        <span>水蒸気量</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 20, height: 20, background: "green" }} />
        <span>水滴の量</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 20, height: 20, background: "orange" }} />
        <span>まだ空気中に含むことができる水蒸気量</span>
      </div>
    </div>
  );
};

export default ExplanationBarGraph;