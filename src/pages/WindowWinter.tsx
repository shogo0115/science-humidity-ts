import React, { useEffect, useMemo, useRef, useState } from "react";
import "./window-winter.css";
import { useNavigate } from "react-router-dom";

// 飽和水蒸気量の近似式群（元のJSと同じロジック）
function e(T: number): number {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
function a(T: number): number {
  return parseFloat(((217 * e(T)) / (T + 273.15)).toFixed(1)); // g/m^3
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const WindowWinter: React.FC = () => {
  const navigate = useNavigate();

  // --- 状態（元の初期値に合わせる） ---
  const [roomTemp, setRoomTemp] = useState<number>(20); // 室温（部屋の温度）
  const [moisture, setMoisture] = useState<number>(5);  // 空間内の水分量 g/m^3
  const [cupTemp, setCupTemp] = useState<number>(14);   // 外（または窓）温度の表示に使う値
  const [running, setRunning] = useState<boolean>(false);

  // 実験開始前のスナップショット
  const initialRef = useRef<{ room: number; moist: number; cup: number } | null>(null);

  // setInterval を停止するための参照
  const timerRef = useRef<number | null>(null);

  // Canvas 関連
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctx = useMemo(() => {
    const c = canvasRef.current;
    return c ? c.getContext("2d") : null;
  }, [canvasRef.current]);

  // 描画計算で使う座標系
  const originX = 120; // 左マージン
  const originY = 300; // 下マージン（キャンバス 350 高に合わせる）
  const unitX = (550 - 150) / 35; // 横スケール
  const unitY = (350 - 100) / 40; // 縦スケール

  // 湿度（%）
  const humidity = useMemo(() => {
    const sat = a(roomTemp);
    const h = (moisture / sat) * 100;
    return clamp(parseFloat(h.toFixed(1)), 0, 100);
  }, [roomTemp, moisture]);

  // 結露の判定
  const isCondensed = useMemo(() => moisture - a(roomTemp) >= 0.1, [roomTemp, moisture]);

  // 画像ファイル名（public/window に配置）
  const windowPng = useMemo(() => {
    const roundedTemp = Math.ceil(cupTemp / 2) * 2; // 2℃刻み
    const waterExcess = Math.max(0, moisture - a(roomTemp));
    const roundedWater = Math.min(Math.ceil(waterExcess / 5) * 5, 35); // 5 g/m^3 刻み（最大 35）
    return `/winter-window/window-${roundedTemp}-${roundedWater}.png`;
  }, [cupTemp, moisture, roomTemp]);

  // グラフ描画
  const drawAxis = (g: CanvasRenderingContext2D) => {
    g.strokeStyle = "black";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(originX, 0);
    g.lineTo(originX, originY);
    g.lineTo(550, originY);
    g.stroke();

    // X軸ラベル
    g.font = "16px Arial";
    g.fillStyle = "black";
    g.textAlign = "center";
    g.fillText("部屋の温度 (°C)", 550 / 2 + 40, originY + 40);

    // Y軸ラベル（縦）
    g.save();
    g.translate(50, 350 / 2);
    g.rotate(-Math.PI / 2);
    g.textAlign = "center";
    g.fillText("飽和水蒸気量 (g/m³)", 0, 0);
    g.restore();
  };

  const drawScaleX = (g: CanvasRenderingContext2D) => {
    g.font = "12px Arial";
    g.fillStyle = "black";
    for (let i = 0; i <= 35; i += 5) {
      const x = originX + i * unitX;
      g.beginPath();
      g.moveTo(x, originY);
      g.lineTo(x, originY + 10);
      g.stroke();
      g.fillText(`${i}°C`, x - 10, originY + 20);
    }
  };

  const drawScaleY = (g: CanvasRenderingContext2D) => {
    g.font = "12px Arial";
    g.fillStyle = "black";
    for (let j = 0; j <= 40; j += 10) {
      const y = originY - j * unitY;
      g.beginPath();
      g.moveTo(originX, y);
      g.lineTo(originX - 10, y);
      g.stroke();
      g.fillText(`${j}g/m³`, originX - 35, y + 5);
    }
  };

  const drawSaturationCurve = (g: CanvasRenderingContext2D) => {
    g.strokeStyle = "black";
    g.lineWidth = 2;
    g.beginPath();
    for (let t = 0; t <= 35; t++) {
      const x = originX + t * unitX;
      const y = originY - a(t) * unitY;
      if (t === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  };

  const drawBars = (g: CanvasRenderingContext2D) => {
    const barWidth = 8;
    const T = roomTemp;
    const vapor = moisture;

    const vaporAtT = a(T);
    const x = originX + T * unitX;

    // 青：水蒸気量
    g.fillStyle = "blue";
    g.fillRect(x - barWidth / 2, originY, barWidth, -vapor * unitY);

    // 緑（過飽和） or オレンジ（飽和未満）
    if (vapor > vaporAtT) {
      g.fillStyle = "green";
      g.fillRect(x - barWidth / 2, originY - vaporAtT * unitY, barWidth, -(vapor - vaporAtT) * unitY);
    } else {
      g.fillStyle = "orange";
      g.fillRect(x - barWidth / 2, originY - vapor * unitY, barWidth, (vaporAtT - vapor) * -unitY);
    }
  };

  // Canvas再描画
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;
    const g = ctx;
    g.clearRect(0, 0, 550, 350);
    drawAxis(g);
    drawScaleX(g);
    drawScaleY(g);
    drawSaturationCurve(g);
    drawBars(g);
  }, [ctx, roomTemp, moisture]);

  // 実験の開始/停止
  const toggleExperiment = () => {
    if (!running) {
      // 開始
      initialRef.current = { room: roomTemp, moist: moisture, cup: cupTemp };
      setRunning(true);

      // ボタン群を擬似的に無効化 → 実装は下の disableDuringRun で制御
      timerRef.current = window.setInterval(() => {
        setRoomTemp(prev => {
          const next =
            prev > cupTemp ? parseFloat((prev - 0.1).toFixed(1))
                           : prev < cupTemp ? parseFloat((prev + 0.1).toFixed(1))
                                            : prev;
          return next;
        });
      }, 200);
    } else {
      // 停止 → 初期値へ戻す
      setRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (initialRef.current) {
        setRoomTemp(initialRef.current.room);
        setMoisture(initialRef.current.moist);
        setCupTemp(initialRef.current.cup);
      }
    }
  };

  const disableDuringRun = running;

  return (
    <div className="ww-body">
      {/* トップボタン */}
      <div className="top-buttons">
        <button className="nav-button" onClick={() => navigate("/")}>ホームに戻る</button>
        <button className="nav-button" onClick={() => navigate("/house")}>違うものを調べる</button>
      </div>

      {/* 実験説明 */}
      <div id="description-container">
        <div id="condensation-explanation">
          室内の暖かい空気が冷たい窓に触れ、水蒸気量が飽和水蒸気量を超えることで、<br />
          水滴が発生します。そのため水滴は窓の内側に発生します。
        </div>

        <div id="experiment-controls">
          <p id="description-text">
            ＜実験内容＞<br />
            室温 <span>{running ? (initialRef.current?.room ?? roomTemp) : roomTemp}</span>℃ 、空間内の水分量 <span>{moisture.toFixed(1)}</span>g/m³ の部屋があり
            <br />
            外の気温が <span>{cupTemp}</span>℃ の時の窓の様子を観察する。
          </p>
          <button
            id="startExperimentButton"
            className={`button ${running ? "running" : ""}`}
            onClick={toggleExperiment}
          >
            {running ? "実験をやめる" : "実験を開始する"}
          </button>
        </div>
      </div>

      {/* コントロール群 */}
      <div className="controls">
        <div className="control" id="remote-control">
          <label>室温 (窓のまわりの温度): <span id="roomTempDisplay">{roomTemp}</span>°C</label>
          <button className="button" onClick={() => setRoomTemp(t => clamp(parseFloat((t + 1).toFixed(1)), 14, 26))} disabled={disableDuringRun || roomTemp >= 26}>＋</button>
          <span>(1℃上がる)</span>
          <button className="button" onClick={() => setRoomTemp(t => clamp(parseFloat((t - 1).toFixed(1)), 14, 26))} disabled={disableDuringRun || roomTemp <= 14}>－</button>
          <span>(1℃下がる)</span>
        </div>

        <div className="control">
          <label>空間内の水分量: <span id="moistureDisplay">{moisture.toFixed(1)}</span>g/m³</label>
          <button className="button" onClick={() => setMoisture(m => clamp(parseFloat((m + 1).toFixed(1)), 5, 40))} disabled={disableDuringRun || moisture >= 40}>加湿する</button>
          <span>(1g/m³増える)</span>
          <button className="button" onClick={() => setMoisture(m => clamp(parseFloat((m - 1).toFixed(1)), 5, 40))} disabled={disableDuringRun || moisture <= 5}>除湿する</button>
          <span>(1g/m³減る)</span>
        </div>

        <div className="control" id="cup-control">
          <div className="temperature-display">
            <span id="cupTempLabel">外の気温</span>: <span id="cupTempDisplay">{cupTemp}</span>°C
          </div>
          <button className="button" onClick={() => setCupTemp(t => clamp(t + 1, 0, 14))} disabled={disableDuringRun || cupTemp >= 14}>＋</button>
          <br />（1℃上がる）
          <button className="button" onClick={() => setCupTemp(t => clamp(t - 1, 0, 14))} disabled={disableDuringRun || cupTemp <= 0}>－</button>
          <br />（1℃下がる）
        </div>
      </div>

      {/* 画像 + グラフ */}
      <div id="cup-container">
        <div id="layout-container">
          <div id="photos-container">
            {/* 窓画像（温度・水滴量で動的に切替） */}
            <img id="cup-image" src={windowPng} alt="窓の画像" style={{ width: 350, height: 350, objectFit: "cover" }} />
            {/* 冬の背景（固定） */}
            <img id="temperature-image" src="/window/winter-sky.png" alt="冬の空" style={{ width: 300, height: "auto", display: "block", margin: "0 auto" }} />
          </div>

          <div id="condensationTextContainer">
            <div id="condensationText" style={{ color: isCondensed ? "red" : "gray" }}>
              {isCondensed ? "結露が発生！" : "結露は発生　していない"}
            </div>
            <div id="humidityText">湿度: <span id="humidityDisplay">{humidity}</span>%</div>
          </div>

          <div id="graph-container">
            <canvas ref={canvasRef} id="graphCanvas" width={550} height={350} />
            <div id="legend">
              <div className="legend-item"><div className="legend-color" style={{ backgroundColor: "blue" }} /> <span>水蒸気量</span></div>
              <div className="legend-item"><div className="legend-color" style={{ backgroundColor: "green" }} /> <span>水滴の量</span></div>
              <div className="legend-item"><div className="legend-color" style={{ backgroundColor: "orange" }} /> <span>まだ空気中に含むことができる水蒸気量</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindowWinter;
