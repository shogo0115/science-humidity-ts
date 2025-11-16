import React from "react";

interface TowelCanvasAndLegendProps {
  temperature: number;
  water: number;
  humidity: number;
  cupTemperature: number;
}

function getCupImageName(water: number): string {
    let setTowel: number;

    // 0℃の場合の特別処理: 0℃は0に、それより大きい場合は5の倍数に切り上げ
    if (water <= 0.1) {
        setTowel = 0;
    }
      else if (water >= 30) {
        setTowel = 30;
      }
      else {
        setTowel = Math.ceil(water / 5) * 5;
    }

    // 画像名を決定し、stringとして返す
    return `/towel/towel2-${setTowel}.png`;
}

const TowelCanvasAndLegend: React.FC<TowelCanvasAndLegendProps> = ({
  water
}) => {


    // 💡 純粋な関数として画像パスを取得 (TS2322 エラー解消)
    const cupImageName = getCupImageName(water);

  return (
    <div id="photos-container">
      <img
      id="cup-image"
      src={cupImageName}
      alt={`タオルの状態: タオルに含まれる水分量${water.toFixed(1)}g/m³`}
      style={{ width: '400px', height: 'auto' }}
      />
      <img
      id="temperature-image"
      src="/towel/towel-water.png"
      alt="タオル画像"
      style={{ width: '400px', height: 'auto' }}
      />
    </div>
  );
};

export default TowelCanvasAndLegend;