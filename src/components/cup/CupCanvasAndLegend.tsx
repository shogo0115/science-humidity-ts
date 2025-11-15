import React from "react";
import "./cupCanvasAndLegend.css";

interface CupCanvasAndLegendProps {
  temperature: number;
  waterDrop: number;
  humidity: number;
  cupTemperature: number;
}

function getCupImageName(cupTemperature: number, cupWaterDrop: number): string {
    let roundedTemp: number;

    // 0℃の場合の特別処理: 0℃は0に、それより大きい場合は5の倍数に切り上げ
    if (cupTemperature <= 0.1) {
        roundedTemp = 2.5;
    }
      else if (cupTemperature >= 17.5) {
        roundedTemp = 17.5;
      }
      else {
        roundedTemp = Math.ceil(cupTemperature / 2.5) * 2.5;
    }

    const roundedWater = Math.min(Math.ceil(cupWaterDrop / 5) * 5, 35);

    return `/glass/glass-${roundedTemp * 2}-${roundedWater}.png`;
}

const CupCanvasAndLegend: React.FC<CupCanvasAndLegendProps> = ({
  waterDrop,
  cupTemperature
}) => {
    const cupImageName = getCupImageName(cupTemperature, waterDrop);

  return (
    <div className="picture-layout">
      <img id="cup-image" src={cupImageName} alt={`コップの周りの状態: 温度${cupTemperature.toFixed(1)}℃ 結露量${waterDrop.toFixed(1)}g/m³`} />
      <img id="temperature-image" src="/glass/glass-color.png" alt="水の温度説明画像" />
    </div>
  );
};

export default CupCanvasAndLegend;