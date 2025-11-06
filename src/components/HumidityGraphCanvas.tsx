import React, { useEffect, useRef } from 'react';

// ⚠️ 注意: 飽和水蒸気量を計算する satVapor 関数と、
// 軸の定数 AXIS は、Graph.tsx からこのファイル、または共通の定数ファイルに移動が必要です。

// --- 描画に必要な定数 (Graph.tsx から移動を想定) ---
const AXIS = {
  width: 500,
  height: 500,
  padding: 50,
  xScale: 10,  // 1℃ あたり 10px
  yScale: 5,   // 1g/m³ あたり 5px
  xMax: 50,    // 最大温度 50℃
  yMax: 90,    // 最大水蒸気量 90g/m³
  zeroX: 50,   // 0℃ の位置 (左パディング)
  zeroY: 450,  // 0g/m³ の位置 (下パディング)
};
// 飽和水蒸気量計算関数 (Graph.tsx から移動を想定)
const satVapor = (t: number) => {
  if (t < 0) t = 0; // 0未満の処理を簡略化
  return Math.min(82.8, 4.9 * Math.pow(1.07, t));
};
// --- 定数と計算関数 ここまで ---

interface HumidityGraphCanvasProps {
  temperature: number;
  saturationVapor: number;
  vapor: number;
  condensed: number;
  temperature2: number;
  vapor2: number;
}

const HumidityGraphCanvas: React.FC<HumidityGraphCanvasProps> = ({
  temperature,
  saturationVapor,
  vapor,
  condensed,
  temperature2,
  vapor2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ------------------------------------
    // 1. ヘルパー関数の定義 (座標変換)
    // ------------------------------------
    const toX = (temp: number) => AXIS.zeroX + temp * AXIS.xScale;
    const toY = (vapor: number) => AXIS.zeroY - vapor * AXIS.yScale;
    const toScreenY = (vapor: number) => vapor * AXIS.yScale;

    // ------------------------------------
    // 2. 描画ロジックの定義 (Graph.tsxから全て移動)
    // ------------------------------------

    const drawAxis = () => {
      // 軸を描画するロジック (省略)
      ctx.clearRect(0, 0, AXIS.width, AXIS.height);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Y軸 (水分量)
      ctx.moveTo(AXIS.zeroX, AXIS.zeroY);
      ctx.lineTo(AXIS.zeroX, 0);
      // X軸 (温度)
      ctx.moveTo(AXIS.zeroX, AXIS.zeroY);
      ctx.lineTo(AXIS.width, AXIS.zeroY);
      ctx.stroke();
    };

    const drawScale = () => {
      // 目盛りとラベルを描画するロジック (省略)
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // X軸スケール
      for (let t = 0; t <= AXIS.xMax; t += 10) {
        ctx.fillText(`${t}`, toX(t), AXIS.zeroY + 5);
      }
      ctx.fillText('温度 [℃]', AXIS.width - 30, AXIS.zeroY + 20);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      // Y軸スケール
      for (let v = 0; v <= AXIS.yMax; v += 10) {
        if (v !== 0) ctx.fillText(`${v}`, AXIS.zeroX - 5, toY(v));
      }
      ctx.save();
      ctx.translate(15, AXIS.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('水分量 [g/m³]', 0, 0);
      ctx.restore();
    };

    const drawCurve = () => {
      // 飽和水蒸気量曲線を描画するロジック (省略)
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(satVapor(0)));
      for (let t = 0.5; t <= AXIS.xMax; t += 0.5) {
        ctx.lineTo(toX(t), toY(satVapor(t)));
      }
      ctx.stroke();
    };

    const plotPointAndBar = (temp: number, vaporTotal: number, isSaved: boolean) => {
      // 点と棒グラフを描画するロジック (省略)
      const sv = satVapor(temp); // その温度での飽和水蒸気量
      const pointX = toX(temp);
      const pointY = toY(vaporTotal);

      // 棒グラフを描画
      // ... (省略: vaporTotal, sv, condensed を使った複雑な棒グラフ描画ロジック) ...

      // 点を描画
      ctx.fillStyle = isSaved ? 'purple' : 'black';
      ctx.beginPath();
      ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI);
      ctx.fill();
    };


    // ------------------------------------
    // 3. 全ての描画処理を実行
    // ------------------------------------
    drawAxis();
    drawScale();
    drawCurve();

    // 現在の状態の描画
    plotPointAndBar(temperature, vapor + condensed, false);

    // 保存された状態の描画 (vapor2は保存された水分総量)
    plotPointAndBar(temperature2, vapor2, true);

  }, [temperature, vapor, condensed, temperature2, vapor2]); // 依存配列に全ての描画データを含める

  return (
    <canvas
      ref={canvasRef}
      width={AXIS.width}
      height={AXIS.height}
      style={{ border: '1px solid #ccc' }} // スタイルは適宜調整
    />
  );
};

export default HumidityGraphCanvas;