import React from "react";

interface CupCanvasAndLegendProps {
  waterDrop: number;
  originTemp: number;
}

function getCupImageName(cupTemperature: number, cupWaterDrop: number): string {
    let roundedTemp: number;

    // 0℃の場合の特別処理: 0℃は0に、それより大きい場合は5の倍数に切り上げ
    if (cupTemperature <= 0.1) {
        roundedTemp = 5;
    }
      else if (cupTemperature >= 35) {
        roundedTemp = 35;
      }
      else {
        roundedTemp = Math.ceil(cupTemperature / 5) * 5;
    }

    const roundedWater = Math.min(Math.ceil(cupWaterDrop / 5) * 5, 35);

    return `/glass/glass-${roundedTemp}-${roundedWater}.png`;
}

const CupCanvasAndLegend: React.FC<CupCanvasAndLegendProps> = ({
  waterDrop,
  originTemp: tergetTemp
}) => {
    const cupImageName = getCupImageName(tergetTemp, waterDrop);

  return (
    <div className="picture-layout">
      <img
      id="cup-image"
      src={cupImageName}
      alt={`コップの周りの状態: 温度${tergetTemp.toFixed(1)}℃ 結露量${waterDrop.toFixed(1)}g/m³`}
      style={{ width: '300px', height: 'auto' }}
      />
      <img
      id="temperature-image"
      src="/glass/glass-color.png"
      alt="水の温度説明画像"
      style={{ width: '400px', height: 'auto' }}/>
    </div>
  );
};

export default CupCanvasAndLegend;