import React from "react";

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

    // 画像名を決定し、stringとして返す
    return `/glass/glass-${roundedTemp * 2}-${roundedWater}.png`;
}

const CupCanvasAndLegend: React.FC<CupCanvasAndLegendProps> = ({
  temperature,
  waterDrop,
  humidity,
  cupTemperature
}) => {
    // 結露が発生しているかどうかの判定 (水滴量が 0.1g/m^3 以上)
    const isCondensed = waterDrop > 0.1;

    // 💡 純粋な関数として画像パスを取得 (TS2322 エラー解消)
    const cupImageName = getCupImageName(cupTemperature, waterDrop);

  return (
    <div id="cup-container">
      <div id="layout-container">

        {/* 画像コンテナ */}
        <div id="photos-container">
          <img id="cup-image" src={cupImageName} alt={`コップの周りの状態: 温度${temperature.toFixed(1)}℃ 結露量${waterDrop.toFixed(1)}g/m³`} />
          <img id="temperature-image" src="/glass/glass-color.png" alt="水の温度説明画像" />
        </div>

      </div>
    </div>
  );
};

export default CupCanvasAndLegend;