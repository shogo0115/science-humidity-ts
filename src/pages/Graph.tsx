import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./graph_copy.css";
//import "../components/CurrentHumidityDisplay.css";

// --- 作成済みのカスタムコンポーネントをインポート ---
import ExplanationBarGraph from "../components/ExplanationBarGraph";
import ExplanationFormulas from "../components/ExplanationFormulas";
import CurrentHumidityDisplay from "../components/CurrentHumidityDisplay";
import SavedHumidityDisplay from "../components/SavedHumidityDisplay";
import HumidityGraphCanvas from "../components/HumidityGraphCanvas";

    // ------------------------------------
    // 1. 関数の定義 (座標変換)
    // ------------------------------------
function satPress(T: number) {
  return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
function satVapor(T: number) {
    return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

function buildSaturationTable() {
  const table: { temperature: number; saturationVapor: number }[] = [];
  for (let T = 0; T <= 50.1; T += 0.1) {
    const t = parseFloat(T.toFixed(1));
    table.push({ temperature: t, saturationVapor: satVapor(t) });
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

    // ------------------------------------
    // 2. コンポーネントの初期化と状態定義
    // ------------------------------------
const Graph: React.FC = () => {
  const navigate = useNavigate();
  const table = useMemo(() => buildSaturationTable(), []);

  /** ------- 状態（気体1：現在の空間） ------- */
  const [temperature, setTemperature] = useState<number>(0.0);
  const [saturationVapor, setSaturationVapor] = useState<number>(4.9);
  const [vapor, setVapor] = useState<number>(4.9);
  const [humidity, setHumidity] = useState<number>(100);
  const [waterDrop, setWaterDrop] = useState<number>(0.0);
  //const [RemainingVapor, setRemainingVapor] = useState<number>(0.0);

  /** ------- 状態（気体2：保存した状態） ------- */
  const [temperature2, setTemperature2] = useState<number>(0.0);
  const [saturationVapor2, setSaturationVapor2] = useState<number>(4.9);
  const [vapor2, setVapor2] = useState<number>(4.9);
  const [humidity2, setHumidity2] = useState<number>(100);
  const [waterDrop2, setWaterDrop2] = useState<number>(0.0);
  //const [RemainingVapor2, setRemainingVapor2] = useState<number>(0.0);

  /** ------- 固定ボタンの状態 ------- */
  const [fixTemperature, setFixTemperature] = useState<boolean>(false);
  const [fixVapor, setFixVapor] = useState<boolean>(false);

    // ------------------------------------
    // 3. ユーザの操作による変化
    // ------------------------------------
    /** 温度固定 / 水分量固定 */
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

// 0-1. 温度→飽和水蒸気量 (T -> SV)
// 温度が変化したら、常に飽和水蒸気量を計算し更新する
useEffect(() => {
  const sv = satVapor(temperature);
  const capped = Math.min(sv, 82.8);
  setSaturationVapor(parseFloat(capped.toFixed(1)));
}, [temperature]);

// 0-2. 飽和水蒸気量→温度 (SV -> T)
// 飽和水蒸気量が変化したら、常に温度を計算し更新する
useEffect(() => {
  const t = temperatureFromSaturationVapor(saturationVapor, table);
  setTemperature(parseFloat(t.toFixed(1)));
}, [saturationVapor, table]);

// 湿度計算 (vaporとsvから計算される)
useEffect(() => {
  if (!fixTemperature && !fixVapor) {
    const h = Math.min(100, (vapor / saturationVapor) * 100);
    setHumidity(parseFloat(h.toFixed(1)));
  }
}, [vapor, saturationVapor, fixTemperature, fixVapor]);

// 湿度→水蒸気量（温度固定）
useEffect(() => {
  if (fixTemperature) {
    const v = (humidity / 100) * saturationVapor;
    setVapor(parseFloat(v.toFixed(1)));
  }
}, [humidity, saturationVapor, fixTemperature]);

// 3-1. 湿度操作時：湿度→飽和水蒸気量→温度
useEffect(() => {
  if (fixVapor) {
    const sv = vapor / (humidity / 100);
    const capped = Math.min(sv, 82.8);

    // 飽和水蒸気量から温度を逆算
    const t = temperatureFromSaturationVapor(capped, table);
    setTemperature(parseFloat(t.toFixed(1)));
  }
}, [humidity, vapor, fixVapor, table]);

// 水滴の量の計算
useEffect(() => {
  const wd = Math.max(0, vapor - saturationVapor);
  setWaterDrop(parseFloat(wd.toFixed(1)));
}, [vapor, saturationVapor]);
  //まだ空気中に含むことができる水蒸気量
  const remainingVapor = Math.max(0, saturationVapor - vapor);
  const remainingVapor2 = Math.max(0, saturationVapor2 - vapor2);

  /** 初期状態へ保存 */
  const saveState = () => {
    setTemperature2(temperature);
    setSaturationVapor2(saturationVapor);
    setVapor2(vapor);
    setHumidity2(humidity);
    setWaterDrop2(waterDrop);
    //setRemainingVapor2(remainingVapor);
  };

    // ------------------------------------
    // 4. UI
    // ------------------------------------
  return (
    <div className="graph-container">

      <button className="graph-back-button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      <div className="graph-main-layout">
        <div className="graph-area-wrap">
          <div className="legend-formula-column">
            <ExplanationBarGraph />
            <ExplanationFormulas />
          </div>

          {/* キャンバス */}
          <div className="graph-canvas-wrap">
            <HumidityGraphCanvas
            temperature={temperature}
            saturationVapor={saturationVapor}
            vapor={vapor}
            waterDrop={waterDrop}
            remainingVapor={remainingVapor}
            temperature2={temperature2}
            saturationVapor2={saturationVapor2}
            vapor2={vapor2}
            waterDrop2={waterDrop2}
            remainingVapor2={remainingVapor2}
            />
          </div>
        </div>

      <div className="graph-controls">
        {/* 空間の状態 */}
        <CurrentHumidityDisplay
          // データ
          temperature={temperature}
          saturationVapor={saturationVapor}
          vapor={vapor}
          humidity={humidity}
          waterDrop={waterDrop}
          fixTemperature={fixTemperature}
          fixVapor={fixVapor}
          // 関数
          setTemperature={setTemperature}
          setSaturationVapor={setSaturationVapor}
          setVapor={setVapor}
          setHumidity={setHumidity}
          toggleFixTemperature={toggleFixTemperature}
          toggleFixVapor={toggleFixVapor}
          saveState={saveState}
        />
        {/* 保存した状態 */}
        <SavedHumidityDisplay
          temperature2={temperature2}
          saturationVapor2={saturationVapor2}
          vapor2={vapor2}
          humidity2={humidity2}
          waterDrop2={waterDrop2}
        />
      </div>

      </div>
    </div>
  );
};

export default Graph;