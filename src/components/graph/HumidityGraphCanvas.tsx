import React, { useEffect, useRef } from 'react';
import "./savedHumidityDisplay.css";

// --- 描画に必要な定数 (Graph.tsx から移動を想定) ---
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

// --- 定数と計算関数 ここまで ---

interface HumidityGraphCanvasProps {
  // 1. 現在の状態 (通常、黒い点とカラフルな棒グラフ)
  temperature: number;            // 現在の空間の温度 [℃]
  saturationVapor: number;        // 現在の温度における飽和水蒸気量 [g/m³]
  vapor: number;                  // 現在の水蒸気量 [g/m³] (青)
  waterDrop: number;              // 現在の水滴の量 [g/m³] (緑)
  remainingVapor: number;         // 現在のまだ空気中に含むことができる水蒸気量 [g/m³] (オレンジ)

  // 2. 保存された初期状態 (通常、紫の点と灰色の棒グラフ)
  temperature2: number;           // 保存された空間の温度 [℃]
  saturationVapor2: number;       // 保存された温度における飽和水蒸気量 [g/m³]
  vapor2: number;                 // 保存された水蒸気量 [g/m³]
  waterDrop2: number;             // 保存された水滴の量 [g/m³]
  remainingVapor2: number;        // 保存されたまだ空気中に含むことができる水蒸気量 [g/m³]
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
    // 1. ヘルパー関数の定義 (座標変換)
    // ------------------------------------
    const toX = (temp: number) => AXIS.zeroX + temp * AXIS.xScale;
    const toY = (vapor: number) => AXIS.zeroY - vapor * AXIS.yScale;
    const toScreenY = (vapor: number) => vapor * AXIS.yScale;

    // ------------------------------------
    // 2. 描画ロジックの定義 (Graph.tsxから全て移動)
    // ------------------------------------

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

    // ------------------------------------
    // ★ 1. グリッド線の描画
    // ------------------------------------

    // --- X軸（縦線）グリッド ---
    for (let t = 0; t <= AXIS.xMax; t += 1) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;

        // 10℃ごと（目盛り位置）は太い線にする
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

        // 10g/m³ごと（目盛り位置）は太い線にする
        if (v % 10 === 0) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(AXIS.zeroX, toY(v));
        ctx.lineTo(toX(AXIS.xMax), toY(v));
        ctx.stroke();
    }

    // ------------------------------------
    // ★ 2. テキストラベルの描画（既存ロジック）
    // ------------------------------------

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
      // 1. 棒グラフの描画 (3層構造)
      // ------------------------------------
      // (A) 水滴の量 (WaterDrop) - 最も上 (飽和ラインの上)
      // v > sv の場合に wd > 0 となる
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

      /*
      // ------------------------------------
      // 2. 飽和水蒸気量レベルの横線
      // ------------------------------------
      ctx.strokeStyle = isSaved ? 'blue' : 'red'; // 保存:青 / 現在:赤 (参考コードに合わせる)
      ctx.lineWidth = 2;
      ctx.beginPath();
      // グラフの左端からX軸の最大値(toX(AXIS.xMax))まで線を引く
      ctx.moveTo(AXIS.zeroX, toY(drawnVaporAmount));
      ctx.lineTo(toX(AXIS.xMax), toY(drawnVaporAmount));
      ctx.stroke();

      // ------------------------------------
      // 3. 点 (プロット) の描画
      // ------------------------------------
      // 水分総量 (vaporTotal) の位置に点を打つ
      const pointY = toY(vaporTotal);
      ctx.fillStyle = isSaved ? 'purple' : 'black'; // 点の色 (以前のやり取りの提案に合わせる)
      ctx.beginPath();
      ctx.arc(toX(barX), toY(sv), 5, 0, 2 * Math.PI);
      ctx.fill();
      */
    };

    // ------------------------------------
    // 3. 全ての描画処理を実行
    // ------------------------------------
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