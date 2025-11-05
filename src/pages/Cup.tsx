// src/pages/Cup.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./cup.css";
import { useNavigate } from "react-router-dom";


/** 物理計算系ユーティリティ（元のHTML内の式を移植） */
function e_(T: number): number {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
function a_(T: number): number {
  // 飽和水蒸気量 [g/m^3]
  return parseFloat(((217 * e_(T)) / (T + 273.15)).toFixed(1));
}

const ORIGIN_X = 120;
const ORIGIN_Y_MARGIN = 50;

const Cup: React.FC = () => {
  const navigate = useNavigate();

  // --- 状態（元のHTMLの初期値に合わせる） ---
  const [roomTemp, setRoomTemp] = useState<number>(20);
  const [moisture, setMoisture] = useState<number>(5);
  const [cupTemp, setCupTemp] = useState<number>(20);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const coolingTimer = useRef<number | null>(null);

  // 実験前のスナップショット
  const initialRef = useRef<{ room: number; moist: number; cup: number } | null>(null);

  // 描画キャンバス参照
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // レイアウトに依存しない定数（幅/高さから刻みを計算）
  const { unitX, unitY, originY } = useMemo(() => {
    const canvas = canvasRef.current;
    const w = canvas?.width ?? 550;
    const h = canvas?.height ?? 350;
    const uX = (w - 150) / 35;
    const uY = (h - 100) / 40;
    const oY = h - ORIGIN_Y_MARGIN;
    return { unitX: uX, unitY: uY, originY: oY };
  }, []);

  // 湿度（%）
  const humidity = useMemo(() => {
    const sat = a_(roomTemp);
    const h = (moisture / sat) * 100;
    return Math.min(100, Math.max(0, parseFloat(h.toFixed(1))));
  }, [roomTemp, moisture]);

  // 結露の発生判定
  const isCondensed = useMemo(() => {
    return moisture - a_(roomTemp) >= 0.1;
  }, [moisture, roomTemp]);

  // コップ画像の選択（元ロジック移植：5刻みに丸めた温度＆過飽和量）
  const cupImageName = useMemo(() => {
    const roundedTemp = Math.ceil(roomTemp / 5) * 5;
    const waterExcess = Math.max(0, moisture - a_(roomTemp));
    const roundedWater = Math.min(Math.ceil(waterExcess / 5) * 5, 35);
    return `/glass/glass-${roundedTemp}-${roundedWater}.png`;
  }, [roomTemp, moisture]);

  // --- キャンバス描画 ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 軸
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ORIGIN_X, 0);
    ctx.lineTo(ORIGIN_X, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke();

    // X軸ラベル
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("部屋の温度 (°C)", canvas.width / 2 + 40, originY + 40);

    // Y軸ラベル（縦）
    ctx.save();
    ctx.translate(50, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("飽和水蒸気量 (g/m³)", 0, 0);
    ctx.restore();

    // 目盛(X)
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    for (let i = 0; i <= 35; i += 5) {
      const x = ORIGIN_X + i * unitX;
      ctx.beginPath();
      ctx.moveTo(x, originY);
      ctx.lineTo(x, originY + 10);
      ctx.stroke();
      ctx.fillText(`${i}°C`, x - 10, originY + 20);
    }

    // 目盛(Y)
    for (let j = 0; j <= 40; j += 10) {
      const y = originY - j * unitY;
      ctx.beginPath();
      ctx.moveTo(ORIGIN_X, y);
      ctx.lineTo(ORIGIN_X - 10, y);
      ctx.stroke();
      ctx.fillText(`${j}g/m³`, ORIGIN_X - 35, y + 5);
    }

    // 飽和水蒸気量曲線
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t = 0; t <= 35; t++) {
      const x = ORIGIN_X + t * unitX;
      const y = originY - a_(t) * unitY;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 現在値の棒（青＋緑/橙）
    const barW = 8;
    const x = ORIGIN_X + roomTemp * unitX;
    const satAtT = a_(roomTemp);

    // 空気中水蒸気量(青)
    ctx.fillStyle = "blue";
    ctx.fillRect(x - barW / 2, originY, barW, -moisture * unitY);

    if (moisture > satAtT) {
      // 過飽和部分（緑）
      ctx.fillStyle = "green";
      ctx.fillRect(
        x - barW / 2,
        originY - satAtT * unitY,
        barW,
        -(moisture - satAtT) * unitY
      );
    } else {
      // 飽和未満部分（橙）
      ctx.fillStyle = "orange";
      ctx.fillRect(
        x - barW / 2,
        originY - moisture * unitY,
        barW,
        -(satAtT - moisture) * unitY
      );
    }
  }, [roomTemp, moisture, unitX, unitY, originY]);

  // --- 実験開始/停止 ---
  const toggleExperiment = () => {
    if (!isRunning) {
      // start
      initialRef.current = { room: roomTemp, moist: moisture, cup: cupTemp };
      setIsRunning(true);
      // ボタン連打防止のため setInterval を保持
      coolingTimer.current = window.setInterval(() => {
        setRoomTemp((prev) => {
          // roomTemp が cupTemp に近づくよう 0.1℃刻みで更新
          if (Math.abs(prev - cupTemp) < 0.05) {
            if (coolingTimer.current) clearInterval(coolingTimer.current);
            return prev;
          }
          const next =
            prev > cupTemp ? parseFloat((prev - 0.1).toFixed(1)) : parseFloat((prev + 0.1).toFixed(1));
          return next;
        });
      }, 200);
    } else {
      // stop（初期状態に戻す）
      if (coolingTimer.current) {
        clearInterval(coolingTimer.current);
        coolingTimer.current = null;
      }
      setIsRunning(false);
      if (initialRef.current) {
        setRoomTemp(initialRef.current.room);
        setMoisture(initialRef.current.moist);
        setCupTemp(initialRef.current.cup);
      }
    }
  };

  // --- UI コントロール（元の制約と同様） ---
  const incRoom = () => setRoomTemp((v) => Math.min(35, v + 1));
  const decRoom = () => setRoomTemp((v) => Math.max(20, v - 1));
  const incMoist = () => setMoisture((v) => Math.min(40, v + 1));
  const decMoist = () => setMoisture((v) => Math.max(5, v - 1));
  const incCup   = () => setCupTemp((v) => Math.min(35, v + 1));
  const decCup   = () => setCupTemp((v) => Math.max(0, v - 1));

  // 実験中は操作を無効化（元の仕様）
  const disabledWhileRun = isRunning;

  return (
    <div className="cup-page">
      {/* 上部ボタン */}
      <div className="top-buttons">
        <button className="nav-button" onClick={() => navigate("/")} >ホームに戻る</button>
        <button className="nav-button" onClick={() => navigate("/house")}>違うものを調べる</button>
      </div>

      {/* 説明エリア */}
      <div id="description-container">
        <div id="condensation-explanation">
          空気中に含まれる水蒸気がコップの冷たい淵に触れることで凝縮し、水滴が発生します。
        </div>

        <div id="experiment-controls">
          <p id="description-text">
            ＜実験内容＞<br />
            室温 <span>{isRunning && initialRef.current ? initialRef.current.room : roomTemp}</span>℃、
            空間内の水分量 <span>{moisture.toFixed(1)}</span>g/m³ の部屋にある
            コップをゆっくり <span>{cupTemp}</span>℃ まで冷ます
          </p>
          <button
            id="startExperimentButton"
            className={`button ${isRunning ? "running" : ""}`}
            onClick={toggleExperiment}
          >
            {isRunning ? "実験をやめる" : "実験を開始する"}
          </button>
        </div>
      </div>

      {/* コントロール群 */}
      <div className="controls">
        <div className="control" id="remote-control">
          <label>室温（コップのまわりの温度）: <span>{roomTemp}</span>°C</label>
          <button className="button" onClick={incRoom} disabled={disabledWhileRun || roomTemp >= 35}>＋</button>
          <span>(1℃上がる)</span>
          <button className="button" onClick={decRoom} disabled={disabledWhileRun || roomTemp <= 20}>－</button>
          <span>(1℃下がる)</span>
        </div>

        <div className="control">
          <label>空間内の水分量: <span>{moisture.toFixed(1)}</span>g/m³</label>
          <button className="button" onClick={incMoist} disabled={disabledWhileRun || moisture >= 40}>加湿する</button>
          <span>(1g/m³増える)</span>
          <button className="button" onClick={decMoist} disabled={disabledWhileRun || moisture <= 5}>除湿する</button>
          <span>(1g/m³減る)</span>
        </div>

        <div className="control" id="cup-control">
          <div className="temperature-display">
            <span id="cupTempLabel">コップの温度</span>: <span id="cupTempDisplay">{cupTemp}</span>°C
          </div>
          <button className="button" onClick={incCup} disabled={disabledWhileRun || cupTemp >= 20}>＋</button>
          <br />（1℃上がる）
          <button className="button" onClick={decCup} disabled={disabledWhileRun || cupTemp <= 0}>－</button>
          <br />（1℃下がる）
        </div>
      </div>

      {/* 画像 + 凡例 + グラフ */}
      <div id="cup-container">
        <div id="layout-container">
          <div id="photos-container">
            <img id="cup-image" src={cupImageName} alt="コップの画像" />
            <img id="temperature-image" src="/glass/glass-color.png" alt="水の温度説明画像" />
          </div>

          <div id="condensationTextContainer">
            <div
              id="condensationText"
              style={{ color: isCondensed ? "red" : "gray" }}
            >
              {isCondensed ? "結露が発生！" : "結露は発生していない"}
            </div>
            <div id="humidityText">湿度: <span>{humidity}</span>%</div>
          </div>

          <div id="graph-container">
            <canvas ref={canvasRef} id="graphCanvas" width={550} height={350} />
            <div id="legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "blue" }} />
                <span>空気中に含まれている水蒸気量</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "green" }} />
                <span>水滴の量</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "orange" }} />
                <span>まだ空気中に含むことができる水蒸気量</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cup;
