import React from "react";

const ExplanationBarGraph: React.FC = () => {
  return (
    <div style={{ fontSize: "20px" }}>
      <h3>棒グラフの色の説明</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 20, height: 20, background: "rgba(0, 0, 255, 1)" }} />
        <span>水蒸気量</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 20, height: 20, background: "rgba(0, 255, 0, 0.5)" }} />
        <span>水滴の量</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{ width: 20, height: 20, background: "rgba(255, 166, 0, 1)" }} />
        <span>まだ空気中に含むことができる水蒸気量</span>
      </div>
    </div>
  );
};

export default ExplanationBarGraph;