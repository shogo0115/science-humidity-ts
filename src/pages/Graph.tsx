import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./graph.css";

// --- 作成済みのカスタムコンポーネントをインポート ---
import BarChartLegend from "../components/BarChartLegend";
import HumidityFormulas from "../components/HumidityFormulas";
import CurrentHumidityDisplay from "../components/CurrentHumidityDisplay";
import SavedHumidityDisplay from "../components/SavedHumidityDisplay";
import HumidityGraphCanvas from "../components/HumidityGraphCanvas";

// --- Graph.tsx に残すビジネスロジック関数 ---
/** 元コードの数式まわり（温度→飽和水蒸気量） */
function satPress(T: number) {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
// ⚠️ 注意: HumidityGraphCanvas.tsx がこの関数を必要とするため、Graph.tsx から削除し、
//          HumidityGraphCanvas.tsx 内に移動した satVapor を利用する設計とします。
function satVaporForGraph(T: number) {
    return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

/** 0〜50℃を0.1刻みでテーブル化（飽和水蒸気量→温度で利用） */
function buildSaturationTable() {
  const table: { temperature: number; saturationVapor: number }[] = [];
  for (let T = 0; T <= 50.1; T += 0.1) {
    const t = parseFloat(T.toFixed(1));
    // 描画ロジックから satVapor をインポートしている場合、ここではそれを利用すべきです
    table.push({ temperature: t, saturationVapor: satVaporForGraph(t) });
  }
  return table;
}
function temperatureFromSaturationVapor(
  sv: number,
  table: ReturnType<typeof buildSaturationTable>
) {
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


// ----------------------------------------------------------------------
// 🚨 Row, ReadRow の定義は削除しました 🚨
// ----------------------------------------------------------------------


const Graph: React.FC = () => {
  const navigate = useNavigate();
  // const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas 描画ロジックごと移動

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

  /** 初期化 */
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
      // ⚠️ 注意: Graph.tsx の外部ロジック用 satVaporForGraph を利用
      const sv = satVaporForGraph(temperature);
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

  // 「水分量固定」のときは湿度が飽和水蒸気量を決める
  useEffect(() => {
    if (fixVapor) {
      // 飽和水蒸気量 = 水蒸気量 / (湿度 / 100)
      let sv = vapor / (humidity / 100);

      // 飽和水蒸気量が上限 (82.8) を超えないように調整
      const capped = Math.max(4.9, Math.min(sv, 82.8));
      setSaturationVapor(parseFloat(capped.toFixed(1)));

      // 飽和水蒸気量から温度を逆算
      const t = temperatureFromSaturationVapor(capped, table);
      setTemperature(parseFloat(t.toFixed(1)));
    }
  }, [humidity, vapor, fixVapor, table]);

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

  /** ------- Canvas 描画ロジックは HumidityGraphCanvas に移動しました ------- */


  /** UI */
  return (
    <div className="graph-container">
      <button className="graph-back-button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* 凡例 + 公式 -> BarChartLegend と HumidityFormulas に置き換え */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 330 }}>
          <BarChartLegend />
          <HumidityFormulas />
        </div>

        {/* キャンバス -> HumidityGraphCanvas に置き換え */}
        <div className="graph-canvas-wrap">
          <HumidityGraphCanvas
            temperature={temperature}
            saturationVapor={saturationVapor}
            vapor={vapor}
            condensed={condensed}
            temperature2={temperature2}
            vapor2={vapor2}
          />
        </div>

        {/* コントロール群（左右）-> CurrentHumidityDisplay と SavedHumidityDisplay に置き換え */}
        <div className="graph-controls">
          {/* 左：空間の状態（現在） */}
          <CurrentHumidityDisplay
            // データ
            temperature={temperature}
            saturationVapor={saturationVapor}
            vapor={vapor}
            humidity={humidity}
            condensed={condensed}
            fixTemperature={fixTemperature}
            fixVapor={fixVapor}
            // 関数
            setTemperature={setTemperature}
            updateTemperatureFromSV={updateTemperatureFromSV}
            setVapor={setVapor}
            setHumidity={setHumidity}
            toggleFixTemperature={toggleFixTemperature}
            toggleFixVapor={toggleFixVapor}
            saveState={saveState}
          />

          {/* 右：保存した初期状態（参照用） */}
          <SavedHumidityDisplay
            temperature2={temperature2}
            saturationVapor2={saturationVapor2}
            vapor2={vapor2}
            humidity2={humidity2}
            condensed2={condensed2}
          />
        </div>
      </div>
    </div>
  );
};

export default Graph;