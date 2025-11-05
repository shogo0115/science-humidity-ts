import React, { useEffect, useRef, useState } from "react";
import "./towel.css";

// 物理・描画ユーティリティ
function eSat(T: number): number {
  // 飽和水蒸気圧 (hPa) 近似
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
function aSat(T: number): number {
  // 飽和水蒸気量 (g/m^3)
  return parseFloat(((217 * eSat(T)) / (T + 273.15)).toFixed(1));
}

const X_MARGIN = 120; // 左余白
const Y_BASE   = 350 - 50; // 下余白を引いた原点Y（canvas高さ350前提）
const WIDTH    = 550;
const HEIGHT   = 350;
const unitX    = (WIDTH - 150) / 35; // xスケール (0〜35℃)
const unitY    = (HEIGHT - 100) / 40; // yスケール (0〜40 g/m^3)

function drawAxis(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X_MARGIN, 0);
  ctx.lineTo(X_MARGIN, Y_BASE);
  ctx.lineTo(canvas.width, Y_BASE);
  ctx.stroke();

  // x軸ラベル
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("空間の温度 (°C)", canvas.width / 2 + 40, Y_BASE + 40);

  // y軸ラベル（縦）
  ctx.save();
  ctx.translate(50, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("飽和水蒸気量 (g/m³)", 0, 0);
  ctx.restore();
}
function drawScaleX(ctx: CanvasRenderingContext2D) {
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  for (let i = 0; i <= 35; i += 5) {
    const x = X_MARGIN + i * unitX;
    ctx.beginPath();
    ctx.moveTo(x, Y_BASE);
    ctx.lineTo(x, Y_BASE + 10);
    ctx.stroke();
    ctx.fillText(`${i}°C`, x - 10, Y_BASE + 20);
  }
}
function drawScaleY(ctx: CanvasRenderingContext2D) {
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  for (let j = 0; j <= 40; j += 10) {
    const y = Y_BASE - j * unitY;
    ctx.beginPath();
    ctx.moveTo(X_MARGIN, y);
    ctx.lineTo(X_MARGIN - 10, y);
    ctx.stroke();
    ctx.fillText(`${j}g/m³`, X_MARGIN - 35, y + 5);
  }
}
function drawCurve(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let t = 0; t <= 35; t++) {
    const x = X_MARGIN + t * unitX;
    const y = Y_BASE - aSat(t) * unitY;
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function plotPointAndBar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  T: number,
  vapor: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxis(ctx, canvas);
  drawScaleX(ctx);
  drawScaleY(ctx);
  drawCurve(ctx);

  const barWidth = 8;
  const vaporAtT = aSat(T);
  const x = X_MARGIN + T * unitX;

  // 実際の水蒸気量（青）
  ctx.fillStyle = "blue";
  ctx.fillRect(x - barWidth / 2, Y_BASE, barWidth, -vapor * unitY);

  // 差分（緑=超過、橙=不足）
  if (vapor > vaporAtT) {
    ctx.fillStyle = "green";
    ctx.fillRect(
      x - barWidth / 2,
      Y_BASE - vaporAtT * unitY,
      barWidth,
      -(vapor - vaporAtT) * unitY
    );
  } else {
    ctx.fillStyle = "orange";
    ctx.fillRect(
      x - barWidth / 2,
      Y_BASE - vapor * unitY,
      barWidth,
      -(vaporAtT - vapor) * unitY
    );
  }
}

const Towel: React.FC = () => {
  // 状態
  const [roomTemp, setRoomTemp] = useState<number>(20);
  const [moisture, setMoisture] = useState<number>(5.0);
  const [towelWater, setTowelWater] = useState<number>(5); // コップ＝タオルに含む水分（g）
  const [running, setRunning] = useState<boolean>(false);

  // 実験開始時の固定値
  const [fixedStartMoisture, setFixedStartMoisture] = useState<number | null>(null);
  const [fixedStartTowel, setFixedStartTowel] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // 描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    plotPointAndBar(ctx, canvas, roomTemp, moisture);
  }, [roomTemp, moisture]);

  // 湿度（%）
  const humidity = Math.min(100, Math.max(0, (moisture / aSat(roomTemp)) * 100));

  // タオル画像（5の倍数に丸める想定）
  const rounded = Math.max(0, Math.min(35, Math.ceil(towelWater / 5) * 5));
  const towelImage = `/towel/towel2-${rounded}.png`;

  // 実験の開始/停止
  const onToggleExperiment = () => {
    if (running) {
      // 停止
      setRunning(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setFixedStartMoisture(null);
      setFixedStartTowel(null);
      return;
    }
    // 開始
    setRunning(true);
    setFixedStartMoisture(moisture);
    setFixedStartTowel(towelWater);

    timerRef.current = window.setInterval(() => {
      // 飽和未満 && タオルに水が残る間は「蒸発して湿度↑・タオル水分↓」の簡易モデル
      const sat = aSat(roomTemp);
      setMoisture((m) => {
        if (m < sat && towelWater > 0) {
          return Math.min(sat, parseFloat((m + 0.1).toFixed(1)));
        }
        return m;
      });
      setTowelWater((w) => Math.max(0, parseFloat((w - 0.1).toFixed(1))));
    }, 100);
  };

  useEffect(() => {
    if (!running && timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [running]);

  // 片付け
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const canHumidify = moisture < aSat(roomTemp);
  const canDehumid  = moisture > 5;
  const canTempUp   = roomTemp < 35;
  const canTempDown = roomTemp > 10;
  const canWaterUp  = !running && towelWater < 30;
  const canWaterDn  = !running && towelWater > 0;

  return (
    <div className="page-wrap">
      {/* 上部ナビ */}
      <div className="top-buttons">
        <button className="nav-button" onClick={() => (window.location.href = "/title/science_home.html")}>
          ホームに戻る
        </button>
        <button className="nav-button" onClick={() => (window.location.href = "/house")}>
          違うものを調べる
        </button>
      </div>

      {/* 説明 */}
      <div id="description-container">
        <div id="condensation-explanation">
          飽和水蒸気量は温度によって決まり、飽和水蒸気量を上回る水分は空気中に留まれません。
        </div>

        <div id="experiment-controls">
          <p id="description-text">
            ＜実験内容＞ 室温 <b>{roomTemp}</b> ℃、水蒸気量 <b>{fixedStartMoisture ?? moisture}</b> g/m³ の 1m³ 密閉空間に
            タオルが <b>{fixedStartTowel ?? towelWater}</b> g の水を含むとき、時間経過で乾くかを観察する。
            ［湿度: <b>{humidity.toFixed(1)}</b>%］
          </p>

          <button
            id="startExperimentButton"
            className={`button ${running ? "running" : ""}`}
            onClick={onToggleExperiment}
          >
            {running ? "実験をやめる" : "実験を開始する"}
          </button>
        </div>
      </div>

      {/* コントロール */}
      <div className="controls">
        <div className="control">
          <label>温度: <span className="big">{roomTemp}</span> ℃</label>
          <button className="button" onClick={() => setRoomTemp((t) => t + 1)} disabled={!canTempUp}>＋</button>
          <span>(1℃上がる)</span>
          <button className="button" onClick={() => setRoomTemp((t) => t - 1)} disabled={!canTempDown}>－</button>
          <span>(1℃下がる)</span>
        </div>

        <div className="control">
          <label>水蒸気量: <span className="big">{moisture.toFixed(1)}</span> g/m³</label>
          <button className="button" onClick={() => setMoisture((m) => parseFloat((m + 1).toFixed(1)))} disabled={!canHumidify}>
            加湿する
          </button>
          <span>(1 g/m³ 増える)</span>
          <button className="button" onClick={() => setMoisture((m) => parseFloat((m - 1).toFixed(1)))} disabled={!canDehumid}>
            除湿する
          </button>
          <span>(1 g/m³ 減る)</span>
        </div>

        <div className="control">
          <label>タオル水分: <span className="big">{towelWater}</span> g</label>
          <button className="button" onClick={() => setTowelWater((w) => w + 1)} disabled={!canWaterUp}>＋</button>
          <span>(1 g 増やす)</span>
          <button className="button" onClick={() => setTowelWater((w) => w - 1)} disabled={!canWaterDn}>－</button>
          <span>(1 g 減らす)</span>
        </div>
      </div>

      {/* 画像＋グラフ */}
      <div id="layout-container">
        <div id="photos-container">
          <img id="cup-image" src={towelImage} alt="タオル" />
          <img id="temperature-image" src="/towel/towel-water.png" alt="説明" />
        </div>

        <div id="condensationTextContainer">
          <div id="condensationText" style={{ color: towelWater > 0 ? "blue" : "green" }}>
            {towelWater > 0 ? "タオルは 濡れている" : "タオルが 乾いた"}
          </div>
          <div id="humidityText">湿度: <span className="big">{humidity.toFixed(1)}</span>%</div>
        </div>

        <div id="graph-container">
          <canvas ref={canvasRef} id="graphCanvas" width={WIDTH} height={HEIGHT} />
          <div id="legend">
            <div className="legend-item"><div className="legend-color" style={{ background: "blue" }}></div><span>水蒸気量</span></div>
            <div className="legend-item"><div className="legend-color" style={{ background: "green" }}></div><span>水滴の量</span></div>
            <div className="legend-item"><div className="legend-color" style={{ background: "orange" }}></div><span>まだ空気中に含むことができる水蒸気量</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Towel;
