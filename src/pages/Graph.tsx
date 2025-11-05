import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./graph.css";

/** 元コードの数式まわり（温度→飽和水蒸気量） */
function satPress(T: number) {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
function satVapor(T: number) {
  return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

/** 0〜50℃を0.1刻みでテーブル化（飽和水蒸気量→温度で利用） */
function buildSaturationTable() {
  const table: { temperature: number; saturationVapor: number }[] = [];
  for (let T = 0; T <= 50.1; T += 0.1) {
    const t = parseFloat(T.toFixed(1));
    table.push({ temperature: t, saturationVapor: satVapor(t) });
  }
  return table;
}
function temperatureFromSaturationVapor(sv: number, table: ReturnType<typeof buildSaturationTable>) {
  const exact = table.find((x) => x.saturationVapor === sv);
  if (exact) return exact.temperature;
  let bestT = table[0]?.temperature ?? 0;
  let bestDiff = Infinity;
  for (const row of table) {
    const d = Math.abs(row.saturationVapor - sv);
    if (d < bestDiff) {
      bestDiff = d;
      bestT = row.temperature;
    }
  }
  return bestT;
}

const AXIS = {
  originX: 80,
  originY: 540,
  unitX: 10,
  unitY: -5.4,
  width: 1100,
  height: 600,
};

const Graph: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const table = useMemo(() => buildSaturationTable(), []);

  /** ------- 状態（気体1：現在の空間） ------- */
  const [temperature, setTemperature] = useState<number>(0.0);
  const [saturationVapor, setSaturationVapor] = useState<number>(4.9);
  const [vapor, setVapor] = useState<number>(4.9);
  const [humidity, setHumidity] = useState<number>(100);
  const [condensed, setCondensed] = useState<number>(0.0);

  /** ------- 状態（気体2：保存した初期状態のスナップショット） ------- */
  const [temperature2, setTemperature2] = useState<number>(0.0);
  const [saturationVapor2, setSaturationVapor2] = useState<number>(4.9);
  const [vapor2, setVapor2] = useState<number>(4.9);
  const [humidity2, setHumidity2] = useState<number>(100);
  const [condensed2, setCondensed2] = useState<number>(0.0);

  /** ------- 固定ボタンの状態 ------- */
  const [fixTemperature, setFixTemperature] = useState<boolean>(false);
  const [fixVapor, setFixVapor] = useState<boolean>(false);

  /** 初期化（元HTMLの onload 相当） */
  useEffect(() => {
    // 0℃の飽和水蒸気量 = 4.9 g/m3
    setTemperature(0.0);
    setSaturationVapor(4.9);
    setVapor(4.9);
    setHumidity(100);
    setCondensed(0.0);

    setTemperature2(0.0);
    setSaturationVapor2(4.9);
    setVapor2(4.9);
    setHumidity2(100);
    setCondensed2(0.0);
  }, []);

  /** 依存関係（温度→飽和水蒸気量、湿度↔水分量、凝結水） */
  // 温度が動いたら（温度固定でなければ）飽和水蒸気量を a(T) で更新
  useEffect(() => {
    if (!fixTemperature) {
      const sv = satVapor(temperature);
      const capped = Math.min(sv, 82.8);
      setSaturationVapor(parseFloat(capped.toFixed(1)));
    }
  }, [temperature, fixTemperature]);

  // 「温度固定」のときは湿度が空間内の水分量を決める
  useEffect(() => {
    if (fixTemperature) {
      const v = (humidity / 100) * saturationVapor;
      setVapor(parseFloat(v.toFixed(1)));
    }
  }, [humidity, saturationVapor, fixTemperature]);

  // 湿度の計算
  useEffect(() => {
    const h = Math.max(0, Math.min(100, (vapor / saturationVapor) * 100));
    setHumidity(parseFloat(h.toFixed(1)));
  }, [vapor, saturationVapor]);

  // 水滴の量の計算
  useEffect(() => {
    const w = Math.max(0, vapor - saturationVapor);
    setCondensed(parseFloat(w.toFixed(1)));
  }, [vapor, saturationVapor]);

  /** 「飽和水蒸気量 → 温度」への逆算（スライダー直操作対応） */
  const updateTemperatureFromSV = (sv: number) => {
    const capped = Math.max(4.9, Math.min(sv, 82.8));
    setSaturationVapor(parseFloat(capped.toFixed(1)));
    if (!fixTemperature) {
      const t = temperatureFromSaturationVapor(capped, table);
      setTemperature(parseFloat(t.toFixed(1)));
    }
  };

  /** トグル：温度固定 / 水分量固定（どちらか一方に） */
  const toggleFixTemperature = () => {
    setFixTemperature((prev) => {
      const next = !prev;
      if (next) setFixVapor(false);
      return next;
    });
  };
  const toggleFixVapor = () => {
    setFixVapor((prev) => {
      const next = !prev;
      if (next) setFixTemperature(false);
      return next;
    });
  };

  /** 初期状態へ保存（右側のスナップショットへコピー） */
  const saveState = () => {
    setTemperature2(temperature);
    setSaturationVapor2(saturationVapor);
    setVapor2(vapor);
    setHumidity2(humidity);
    setCondensed2(condensed);
  };

  /** ------- Canvas 描画（元の imperative な描画をReactに移植） ------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const { originX, originY, unitX, unitY, width, height } = AXIS;

    // クリア
    ctx.clearRect(0, 0, width, height);
    ctx.font = "20px Arial, sans-serif";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";

    // 軸
    const drawAxis = () => {
      ctx.beginPath();
      // x軸
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + 500, originY);
      ctx.lineTo(originX + 495, originY - 5);
      ctx.moveTo(originX + 500, originY);
      ctx.lineTo(originX + 495, originY + 5);
      // y軸
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX, originY - 500);
      ctx.lineTo(originX - 5, originY - 495);
      ctx.moveTo(originX, originY - 500);
      ctx.lineTo(originX + 5, originY - 495);
      ctx.stroke();

      // x軸ラベル
      ctx.fillText("温度 [℃]", originX + 300, originY + 50);

      // y軸ラベル
      ctx.save();
      ctx.translate(originX - 50, originY - 250);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("水蒸気量 [g/m³]", 0, 0);
      ctx.restore();
    };

    const drawScaleX = () => {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let i = 0; i <= 50; i += 5) {
        const x = originX + i * unitX;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.moveTo(x, originY);
        ctx.lineTo(x, originY + 5);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(`${i}`, x, originY + 10);
      }
      // 縦グリッド
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      for (let i = 0; i <= 50; i += 1) {
        const x = originX + i * unitX;
        ctx.beginPath();
        ctx.moveTo(x, originY);
        ctx.lineTo(x, originY - 500);
        ctx.stroke();
      }
    };

    const drawScaleY = () => {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= 90; i += 10) {
        const y = originY + i * unitY;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.moveTo(originX - 5, y);
        ctx.lineTo(originX, y);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(`${i}`, originX - 10, y);
      }
      // 横グリッド
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      for (let i = 0; i <= 90; i += 2) {
        const y = originY + i * unitY;
        ctx.beginPath();
        ctx.moveTo(originX, y);
        ctx.lineTo(originX + 500, y);
        ctx.stroke();
      }
    };

    const drawCurve = () => {
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(originX, originY + satVapor(0) * unitY);
      for (let T = 0; T <= 50; T += 0.1) {
        const x = originX + T * unitX;
        const y = originY + satVapor(T) * unitY;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const plotPointAndBar = (
      T1: number | null,
      v1: number | null,
      T2: number | null,
      v2: number | null
    ) => {
      const barWidth = 8;

      // 先に気体2（薄め色）
      if (T2 !== null && v2 !== null) {
        const sv2 = satVapor(T2);
        const x2 = originX + T2 * unitX;

        ctx.fillStyle = "rgba(0,0,255,0.5)";
        ctx.fillRect(x2 - barWidth / 2, originY, barWidth, v2 * unitY);
        if (v2 > sv2) {
          ctx.fillStyle = "rgba(0,255,0,0.5)";
          ctx.fillRect(x2 - barWidth / 2, originY + sv2 * unitY, barWidth, (v2 - sv2) * unitY);
        } else {
          ctx.fillStyle = "rgba(255,165,0,0.5)";
          ctx.fillRect(x2 - barWidth / 2, originY + v2 * unitY, barWidth, (sv2 - v2) * unitY);
        }

        // 等飽和線
        ctx.strokeStyle = "rgba(0,0,255,1)";
        ctx.beginPath();
        ctx.moveTo(originX, originY + sv2 * unitY);
        ctx.lineTo(originX + 500, originY + sv2 * unitY);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = "black";
        const labelX2 = originX + 1000;
        const labelY2 = originY + sv2 * unitY;
        ctx.fillText("初めの空間の状態:", labelX2 - 80, labelY2 - 10);
        ctx.fillText(` 飽和水蒸気量 ${sv2.toFixed(1)} g/m³`, labelX2, labelY2 + 10);
        ctx.fillText(`(温度: ${T2.toFixed(1)} °C)`, labelX2, labelY2 + 30);
      }

      // 次に気体1（濃い色）
      if (T1 !== null && v1 !== null) {
        const sv1 = satVapor(T1);
        const x1 = originX + T1 * unitX;

        ctx.fillStyle = "blue";
        ctx.fillRect(x1 - barWidth / 2, originY, barWidth, v1 * unitY);
        if (v1 > sv1) {
          ctx.fillStyle = "green";
          ctx.fillRect(x1 - barWidth / 2, originY + sv1 * unitY, barWidth, (v1 - sv1) * unitY);
        } else {
          ctx.fillStyle = "orange";
          ctx.fillRect(x1 - barWidth / 2, originY + v1 * unitY, barWidth, (sv1 - v1) * unitY);
        }

        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(originX, originY + sv1 * unitY);
        ctx.lineTo(originX + 500, originY + sv1 * unitY);
        ctx.stroke();

        ctx.fillStyle = "black";
        const labelX1 = originX + 720;
        const labelY1 = originY + sv1 * unitY;
        ctx.fillText("空間の状態:", labelX1 - 100, labelY1 - 10);
        ctx.fillText(` 飽和水蒸気量 ${sv1.toFixed(1)} g/m³`, labelX1, labelY1 + 10);
        ctx.fillText(`(温度: ${T1.toFixed(1)} °C)`, labelX1, labelY1 + 30);
      }
    };

    drawAxis();
    drawScaleX();
    drawScaleY();
    drawCurve();
    plotPointAndBar(temperature, vapor, temperature2, vapor2);
  }, [
    temperature,
    vapor,
    temperature2,
    vapor2,
    saturationVapor, // ラベル系の再描画も兼ねて入れておく
  ]);

  /** UI */
  const anyFixed = fixTemperature || fixVapor;
  const humidityEnabled = anyFixed; // どちらか固定しているときに湿度入力可能

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: 16 }}>
        ホームに戻る
      </button>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* 凡例 + 公式 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 330 }}>
          <div>
            <h3>棒グラフの色の説明</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ width: 20, height: 20, background: "blue" }} />
              <span>水蒸気量</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ width: 20, height: 20, background: "green" }} />
              <span>水滴の量</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 20, background: "orange" }} />
              <span>まだ空気中に含むことができる水蒸気量</span>
            </div>
          </div>

          <div>
            <h3>公式</h3>
            <p>
              湿度 [%] = (<span style={{ color: "blue" }}>水蒸気量</span> /{" "}
              <span style={{ color: "red" }}>飽和水蒸気量</span>) × 100
            </p>
            <p>
              <span style={{ color: "green" }}>水滴の量</span> [g/m³] = 空間内の水分量 -{" "}
              <span style={{ color: "red" }}>飽和水蒸気量</span>
            </p>
            <p>
              空間内の水分量 [g/m³] = <span style={{ color: "blue" }}>水蒸気量</span> +{" "}
              <span style={{ color: "green" }}>水滴の量</span>
            </p>
            <p style={{ color: "red", fontWeight: "bold" }}>
              注意: 温度が50℃以上/飽和水蒸気量が82.8以上になると上限で頭打ちします。
            </p>
          </div>
        </div>

        {/* キャンバス */}
        <div style={{ width: 800, margin: "20px auto", textAlign: "center" }}>
          <canvas ref={canvasRef} width={AXIS.width} height={AXIS.height} />
        </div>
      </div>

      {/* コントロール群（左右） */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {/* 左：空間の状態（現在） */}
        <div style={{ flex: 1, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
          <h3>空間の状態</h3>

          {/* 温度 */}
          <Row label="温度 [℃]">
            <input
              type="range"
              min={0}
              max={50}
              step={0.1}
              value={temperature}
              disabled={fixTemperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={50}
              step={0.1}
              value={temperature}
              disabled={fixTemperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value || "0"))}
              style={{ width: 70, color: saturationVapor > 82.8 ? "red" : "inherit" }}
            />
            <span>℃</span>
          </Row>

          {/* 飽和水蒸気量 */}
          <Row label="飽和水蒸気量 [g/m³]">
            <input
              type="range"
              min={4.9}
              max={82.8}
              step={0.1}
              value={saturationVapor}
              disabled={fixTemperature}
              onChange={(e) => updateTemperatureFromSV(parseFloat(e.target.value))}
            />
            <input
              type="number"
              min={4.9}
              max={82.8}
              step={0.1}
              value={saturationVapor}
              disabled={fixTemperature}
              onChange={(e) => updateTemperatureFromSV(parseFloat(e.target.value || "4.9"))}
              style={{ width: 70, color: saturationVapor >= 82.8 ? "red" : "inherit" }}
            />
            <span>g/m³</span>
          </Row>

          {/* 空間内の水分量 */}
          <Row label="空間内の水分量 [g/m³]">
            <input
              type="range"
              min={4.9}
              max={90}
              step={0.1}
              value={vapor}
              disabled={fixVapor}
              onChange={(e) => setVapor(parseFloat(e.target.value))}
            />
            <input
              type="number"
              min={4.9}
              max={90}
              step={0.1}
              value={vapor}
              disabled={fixVapor}
              onChange={(e) => setVapor(parseFloat(e.target.value || "4.9"))}
              style={{ width: 70 }}
            />
            <span>g/m³</span>
          </Row>

          {/* 湿度 */}
          <Row label="湿度 [%]">
            <input
              type="range"
              min={5.9}
              max={100}
              step={0.1}
              value={humidity}
              disabled={!humidityEnabled}
              onChange={(e) => setHumidity(parseFloat(e.target.value))}
            />
            <input
              type="number"
              min={5.9}
              max={100}
              step={0.1}
              value={humidity}
              disabled={!humidityEnabled}
              onChange={(e) => setHumidity(parseFloat(e.target.value || "5.9"))}
              style={{ width: 70 }}
            />
            <span>%</span>
          </Row>

          {/* 水滴の量（読み取り専用に近い扱い） */}
          <Row label="水滴の量 [g/m³]">
            <input
              type="range"
              min={0}
              max={85.1}
              step={0.1}
              value={condensed}
              disabled
              readOnly
            />
            <input
              type="number"
              min={0}
              max={85.1}
              step={0.1}
              value={condensed}
              disabled
              readOnly
              style={{ width: 70 }}
            />
            <span>g/m³</span>
          </Row>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={toggleFixTemperature}
              style={{ background: fixTemperature ? "#ff0000" : "#007bff", color: "white" }}
            >
              {fixTemperature ? "温度を固定中" : "温度を固定"}
            </button>
            <button
              onClick={toggleFixVapor}
              style={{ background: fixVapor ? "#ff0000" : "#007bff", color: "white" }}
            >
              {fixVapor ? "水分量を固定中" : "水分量を固定"}
            </button>
            <button onClick={saveState}>初めの空間の状態として保存</button>
          </div>
        </div>

        {/* 右：保存した初期状態（参照用） */}
        <div style={{ flex: 1, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
          <h3>初めの空間の状態</h3>
          <ReadRow label="温度 [℃]" value={temperature2} unit="℃" />
          <ReadRow label="飽和水蒸気量 [g/m³]" value={saturationVapor2} unit="g/m³" />
          <ReadRow label="空間内の水分量 [g/m³]" value={vapor2} unit="g/m³" />
          <ReadRow label="湿度 [%]" value={humidity2} unit="%" />
          <ReadRow label="水滴の量 [g/m³]" value={condensed2} unit="g/m³" />
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <label style={{ minWidth: 200 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>
    </div>
  );
};

const ReadRow: React.FC<{ label: string; value: number; unit: string }> = ({
  label,
  value,
  unit,
}) => (
  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    }}
  >
    <label style={{ minWidth: 200 }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="number" value={value} readOnly style={{ width: 70 }} />
      <span>{unit}</span>
    </div>
  </div>
);

export default Graph;
