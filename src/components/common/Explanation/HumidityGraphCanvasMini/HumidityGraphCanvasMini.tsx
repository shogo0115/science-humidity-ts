import React, { useEffect, useRef } from 'react';

// 飽和水蒸気圧 [hPa]
export function satPress(T: number) {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
// 飽和水蒸気量 [g/m³]
export function satVapor(T: number) {
    return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

// --- 描画に必要な定数 ---
const AXIS = {
  width: 580,
  height: 530,
  padding: 50,
  xScale: 10,   // 1℃ あたり 10px
  yScale: 5,   // 1g/m³ あたり 5px
  xMax: 60,     // 最大温度 50℃
  yMax: 90,     // 最大水蒸気量 90g/m³
  zeroX: 50,   // 0℃ の位置
  zeroY: 480,  // 0g/m³ の位置
};

interface HumidityGraphCanvasMiniProps {
  temp: number;
  saturationVapor: number;
  vapor: number;
  waterDrop: number;
  remainingVapor: number;
  xAxisLabel: string;
  yAxisLabel: string;
}

const HumidityGraphCanvasMini: React.FC<HumidityGraphCanvasMiniProps> = ({
  temp,
  saturationVapor,
  vapor,
  waterDrop,
  remainingVapor,
  xAxisLabel,
  yAxisLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ------------------------------------
    // 描画ロジックの定義
    // ------------------------------------
    const toX = (temp: number) => AXIS.zeroX + temp * AXIS.xScale;
    const toY = (vapor: number) => AXIS.zeroY - vapor * AXIS.yScale;
    const toScreenY = (vapor: number) => vapor * AXIS.yScale;

    const drawAxis = () => {
      ctx.clearRect(0, 0, AXIS.width, AXIS.height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Y軸 (飽和水蒸気量)
      ctx.moveTo(AXIS.zeroX, AXIS.zeroY);
      ctx.lineTo(AXIS.zeroX, AXIS.padding / 2);
      // X軸
      ctx.moveTo(AXIS.zeroX, AXIS.zeroY);
      ctx.lineTo(AXIS.width, AXIS.zeroY);
      ctx.stroke();
    };

    const drawScale = () => {
      ctx.fillStyle = '#333';
      ctx.font = '18px Arial';


      // --- X軸（縦線）グリッド ---
      for (let t = 0; t <= AXIS.xMax; t += 5) { // 5℃ ごと
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(toX(t), AXIS.zeroY);
          ctx.lineTo(toX(t), AXIS.padding / 2);
          ctx.stroke();
      }

      // --- Y軸（横線）グリッド ---
      for (let v = 0; v <= AXIS.yMax; v += 10) { // 10g/m³ ごと
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(AXIS.zeroX, toY(v));
          ctx.lineTo(toX(AXIS.xMax), toY(v));
          ctx.stroke();
      }

      // X軸スケール (温度)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let t = 0; t <= AXIS.xMax; t += 10) {
          ctx.fillText(`${t}`, toX(t), AXIS.zeroY + 5);
      }

      // X軸タイトル (温度)
      ctx.font = '20px Arial';
      ctx.fillText(xAxisLabel, AXIS.width / 2, AXIS.zeroY + 30);
      ctx.font = '18px Arial';

      // Y軸スケール (飽和水蒸気量)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let v = 0; v <= AXIS.yMax; v += 10) {
          if (v !== 0) ctx.fillText(`${v}`, AXIS.zeroX - 5, toY(v));
      }

      // Y軸タイトル (回転)
      ctx.save();
      ctx.translate(10, AXIS.height / 2 - 50);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '20px Arial';
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    };

    const drawCurve = () => {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(satVapor(0)));
      for (let t = 0; t <= AXIS.xMax; t += 0.25) {
        ctx.lineTo(toX(t), toY(satVapor(t)));
      }
      ctx.stroke();
    };

    const plotPointAndBar = (
      t: number,
      sv: number,
      v: number,
      wd: number,
      rv: number
    ) => {
      const barWidth = 8;
      const barX = toX(t) - barWidth / 2;
      const drawnVaporAmount = Math.min(v, sv);

      // ------------------------------------
      // 棒グラフの描画 (3層構造)
      // ------------------------------------

      // (A) 水滴の量
      if (wd > 0) {
        const waterDropHeight = toScreenY(wd);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fillRect(barX, toY(sv), barWidth, -waterDropHeight);
      }

      // (B) 空間内の水蒸気量
      const vaporHeight = toScreenY(drawnVaporAmount);
      ctx.fillStyle ='rgba(0, 0, 255, 1)';
      ctx.fillRect(barX, AXIS.zeroY, barWidth, -vaporHeight);

      // (C) 残りの水蒸気量
      if (rv > 0 && sv > v) {
        const remainingHeight = toScreenY(rv);
        ctx.fillStyle = 'rgba(255, 166, 0, 1)';
        ctx.fillRect(barX, toY(v), barWidth, -remainingHeight);
      }

    };

    drawAxis();
    drawScale();
    drawCurve();
    plotPointAndBar(
      temp,
      saturationVapor,
      vapor,
      waterDrop,
      remainingVapor,
    );
  },
  [temp, saturationVapor, vapor, waterDrop, remainingVapor, xAxisLabel, yAxisLabel]
);

  return (
    <canvas
      ref={canvasRef}
      width={AXIS.width}
      height={AXIS.height}
      style={{ border: '0px solid #ccc' }}
    />
  );
};

export default HumidityGraphCanvasMini;