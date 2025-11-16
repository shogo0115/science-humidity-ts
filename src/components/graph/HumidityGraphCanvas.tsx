import React, { useEffect, useRef } from 'react';
import "./savedHumidityDisplay.css";

// --- 描画に必要な定数 ---
export function satPress(T: number) {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
export function satVapor(T: number) {
    return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

// --- 描画に必要な定数 ---
const AXIS = {
  width: 580,
  height: 530,
  padding: 50,
  xScale: 10,  // 1℃ あたり 10px
  yScale: 5,   // 1g/m³ あたり 5px
  xMax: 60,    // 最大温度 50℃
  yMax: 90,    // 最大水蒸気量 90g/m³
  zeroX: 50,   // 0℃ の位置
  zeroY: 480,  // 0g/m³ の位置
};

interface HumidityGraphCanvasProps {
  // 1. 現在の状態
  temperature: number;
  saturationVapor: number;
  vapor: number;
  waterDrop: number;
  remainingVapor: number;

  // 2. 保存された初期状態
  temperature2: number;
  saturationVapor2: number;
  vapor2: number;
  waterDrop2: number;
  remainingVapor2: number;
}

const HumidityGraphCanvas: React.FC<HumidityGraphCanvasProps> = ({
  temperature,
  saturationVapor,
  vapor,
  waterDrop,
  remainingVapor,
  temperature2,
  saturationVapor2,
  vapor2,
  waterDrop2,
  remainingVapor2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ------------------------------------
    // グラフの描画
    // ------------------------------------
    const toX = (temp: number) => AXIS.zeroX + temp * AXIS.xScale;
    const toY = (vapor: number) => AXIS.zeroY - vapor * AXIS.yScale;
    const toScreenY = (vapor: number) => vapor * AXIS.yScale;

    const drawAxis = () => {
      // 軸を描画するロジック
      ctx.clearRect(0, 0, AXIS.width, AXIS.height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Y軸 (飽和水蒸気量)
      ctx.moveTo(AXIS.zeroX, AXIS.zeroY);
      ctx.lineTo(AXIS.zeroX, -AXIS.height);
      // X軸 (温度)
      ctx.moveTo(AXIS.zeroX, AXIS.zeroY);
      ctx.lineTo(AXIS.width, AXIS.zeroY);
      ctx.stroke();
    };

    const drawScale = () => {
    ctx.fillStyle = '#333';
    ctx.font = '18px Arial';

    // --- X軸（縦線）グリッド ---
    for (let t = 0; t <= AXIS.xMax; t += 1) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        if (t % 10 === 0) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(toX(t), AXIS.zeroY);
        ctx.lineTo(toX(t), -AXIS.height);
        ctx.stroke();
    }

    // --- Y軸（横線）グリッド ---
    for (let v = 0; v <= AXIS.yMax; v += 1) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        if (v % 10 === 0) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(AXIS.zeroX, toY(v));
        ctx.lineTo(toX(AXIS.xMax), toY(v));
        ctx.stroke();
    }

    // X軸タイトル (温度)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let t = 0; t <= AXIS.xMax; t += 10) {
        ctx.fillText(`${t}`, toX(t), AXIS.zeroY + 5);
    }
    ctx.fillText('温度 [℃]', AXIS.width / 2, AXIS.zeroY + 30);

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
    ctx.fillText('飽和水蒸気量 [g/m³]', 0, 0);
    ctx.restore();
};

    const drawCurve = () => {
      // 飽和水蒸気量曲線を描画するロジック
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
      temp: number,
      sv: number,
      v: number,
      wd: number,
      rv: number,
      isSaved: boolean
    ) => {
      const barWidth = 8;
      const barX = toX(temp); - barWidth / 2;
      const drawnVaporAmount = Math.min(v, sv);

      // ------------------------------------
      //  棒グラフの描画 (3層構造)
      // ------------------------------------
      // (A) 水滴の量 (WaterDrop)
      if (wd > 0) {
        ctx.fillStyle = isSaved ? 'rgba(0, 255, 0, 0.5)' : '#1abc9c';
        ctx.fillRect(barX, toY(sv), barWidth, -toScreenY(wd));
      }

      // (B) 空間内の水蒸気量 (Vapor)
      ctx.fillStyle = isSaved ? 'rgba(0, 0, 255, 0.5)' : '#3498db';
      ctx.fillRect(barX, toY(drawnVaporAmount), barWidth, toScreenY(drawnVaporAmount));

      // (C) 残りの水蒸気量 (RemainingVapor)
      if (rv > 0) {
        ctx.fillStyle = isSaved ? 'rgba(255, 165, 0, 0.5)' : '#f39c12';
        ctx.fillRect(barX, toY(sv), barWidth, toScreenY(rv));
      }

    };

    drawAxis();
    drawScale();
    drawCurve();

    plotPointAndBar(
      temperature,
      saturationVapor,
      vapor,
      waterDrop,
      remainingVapor,
      false
    );

    plotPointAndBar(
      temperature2,
      saturationVapor2,
      vapor2,
      waterDrop2,
      remainingVapor2,
      true
    );

  }, [temperature,
  saturationVapor,
  vapor,
  waterDrop,
  remainingVapor,
  temperature2,
  saturationVapor2,
  vapor2,
  waterDrop2,
  remainingVapor2]);

  return (
    <canvas
      ref={canvasRef}
      width={AXIS.width}
      height={AXIS.height}
      style={{ border: '0px solid #ccc' }}
    />
  );
};

export default HumidityGraphCanvas;