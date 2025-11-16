import React from "react";

interface WindowCanvasAndLegendProps {
  temperature: number;
  waterDrop: number;
}

function getWindowImageName(temperature: number, waterDrop: number): string {
    let roundedTemp: number;

    // 0℃の場合の特別処理: 0℃は0に、それより大きい場合は5の倍数に切り上げ
    if (temperature <= 0.1) {
        roundedTemp = 2;
    }
      else if (temperature >= 14) {
        roundedTemp = 14;
      }
      else {
        roundedTemp = Math.ceil(temperature / 2) * 2;
    }

    const roundedWater = Math.min(Math.ceil(waterDrop / 5) * 5, 35);

    return `/winter-window/window-${roundedTemp}-${roundedWater}.png`;
}

const WindowCanvasAndLegend: React.FC<WindowCanvasAndLegendProps> = ({
  temperature,
  waterDrop,
}) => {

    const cupImageName = getWindowImageName(temperature, waterDrop);

  return (
    <div id="cup-container">
      <div id="layout-container">

        <div id="photos-container">
          <img
          id="cup-image"
          src={cupImageName}
          alt={`窓付近の状態: 温度${temperature.toFixed(1)}℃ 結露量${waterDrop.toFixed(1)}g/m³`}
          style={{ width: '400px', height: 'auto' }}
          />
          <img
          id="temperature-image"
          src="/winter-window/winter-sky.png"
          alt="外の温度説明画像"
          style={{ width: '400px', height: 'auto' }}
          />
        </div>

      </div>
    </div>
  );
};

export default WindowCanvasAndLegend;