import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cup/cup.css";

import WindowControlPanel from "../../components/window/WindowControlPanel";
import WindowCanvasAndLegend from "../../components/window/WindowCanvasAndLegend";
import HumidityGraphCanvasMini from "../../components/window/HumidityGraphCanvasMini";
import ExplanationBarGraph from "../../components/common/ExplanationBarGraph";
import ExperimentDescription from "../../components/window/ExperimentDescription";
import CondensationStatusDisplay from "../../components/window/CondensationStatusDisplay";


// ------------------------------------
// 1. 関数の定義 (座標変換)
// ------------------------------------
function satPress(T: number) {
 // 水飽和蒸気圧
 return 6.1078 * Math.pow(10, (7.5 * T) / (T + 237.3));
}
function satVapor(T: number) {
 // 飽和水蒸気量
 return parseFloat(((217 * satPress(T)) / (T + 273.15)).toFixed(1));
}

 // ------------------------------------
 // 2. コンポーネントの初期化と状態定義
 // ------------------------------------
const Cup: React.FC = () => {
  const navigate = useNavigate();

 /** ------- 空間の現在の状態 ------- */
 const [temperature, setTemperature] = useState<number>(25.0); // 部屋の温度 (T)
 const [saturationVapor, setSaturationVapor] = useState<number>(23.0); // 飽和水蒸気量 (SV)
 const [vapor, setVapor] = useState<number>(11.5); // 空間の水蒸気量 (V)
 const [waterDrop, setWaterDrop] = useState<number>(0.0);
 const [humidity, setHumidity] = useState<number>(50);

 /** ------- コップの状態 ------- */
 const [cupTemperature, setCupTemperature] = useState<number>(0.0);

/** ------- 実験の状態管理と初期値保存 ------- */
const [isExperimentRunning, setIsExperimentRunning] = useState<boolean>(false);

 // 問題文として表示する初期条件（実験開始時に固定される値）
 const [initialTemperature, setInitialTemperature] = useState<number>(25.0);
 const [initialVapor, setInitialVapor] = useState<number>(11.5);
 const [experimentInitialCupTemp, setExperimentInitialCupTemp] = useState<number>(0.0);


 // ------------------------------------
 // 3. ユーザの操作による変化/計算ロジック
 // ------------------------------------

 useEffect(() => {
  const sv = satVapor(temperature);
  setSaturationVapor(parseFloat(sv.toFixed(1)));
}, [temperature]);

 // 結露量の計算
 useEffect(() => {
  const wd = Math.max(0, vapor - saturationVapor);
  setWaterDrop(parseFloat(wd.toFixed(1)));
}, [vapor, saturationVapor]);

// 湿度計算
 useEffect(() => {
  const h = Math.min(100, (vapor / saturationVapor) * 100);
  setHumidity(parseFloat(h.toFixed(1)));
}, [vapor, saturationVapor]);

// 実験停止中、問題文に表示される初期値を現在のスライダーの値と同期させる
 useEffect(() => {
  if (!isExperimentRunning) {
    setInitialTemperature(temperature);
    setInitialVapor(vapor);
    setExperimentInitialCupTemp(cupTemperature);
  }
 }, [isExperimentRunning, temperature, vapor, cupTemperature]);


// 実験ロジック (コップの温度が目標値となるように室温を変化させるアニメーション)
 useEffect(() => {
  if (!isExperimentRunning) {
    return;
  }

  const targetTemp = experimentInitialCupTemp;

  const intervalId = setInterval(() => {
    setTemperature(currentT => {
      const nextT = currentT - 0.1;

      if (nextT <= targetTemp) {
        clearInterval(intervalId);
        return targetTemp;
      }

      return parseFloat(nextT.toFixed(1));
      });
    }, 500);

    // クリーンアップ関数
    return () => clearInterval(intervalId);
   }, [isExperimentRunning, experimentInitialCupTemp]); // 依存配列を修正

  // 実験開始/停止を切り替える関数（初期値の保存と復元ロジックを追加）
  const toggleExperiment = () => {
    setIsExperimentRunning(prevIsRunning => {
      const nextIsRunning = !prevIsRunning;

      if (nextIsRunning) {
        setInitialTemperature(temperature);
        setInitialVapor(vapor);
        setExperimentInitialCupTemp(cupTemperature);

      } else {

        setTemperature(initialTemperature);
        setVapor(initialVapor);
      }

      return nextIsRunning;
    });
  };


    // まだ空気中に含むことができる水蒸気量
  const remainingVapor = useMemo(() => Math.max(0, saturationVapor - vapor), [saturationVapor, vapor]);

    // ------------------------------------
    // 4. UI
    // ------------------------------------
  return (
    <div className="cup-container">
      <button className="home-back-button" onClick={() => navigate("/")}>
        ホームに戻る
      </button>
      <div className="experiment-main-layout">
        <div className="legend-formula-column">
          <WindowCanvasAndLegend
          temperature={temperature}
          waterDrop={waterDrop}
          humidity={humidity}
          cupTemperature={cupTemperature}
          />
        </div>
        <div className="legend-formula-column">
          <ExplanationBarGraph />
          <CondensationStatusDisplay
          waterDrop={waterDrop}
          humidity={humidity}
          />
        </div>
        <div className="graph-canvas-wrap">
          <HumidityGraphCanvasMini
          temperature={temperature}
          saturationVapor={saturationVapor}
          vapor={vapor}
          waterDrop={waterDrop}
          cupTemperature={cupTemperature}
          remainingVapor={remainingVapor}
          />
        </div>
      </div>
      <div className="graph-controls">
        <ExperimentDescription
        initialTemperature={initialTemperature}
        initialVapor={initialVapor}
        initialCupTemperature={experimentInitialCupTemp}
        isExperimentRunning={isExperimentRunning}
        />
        <WindowControlPanel
          // データ
          temperature={temperature}
          saturationVapor={saturationVapor}
          vapor={vapor}
          cupTemperature={cupTemperature}
          waterDrop={waterDrop}
          remainingVapor={remainingVapor}
          isExperimentRunning={isExperimentRunning}
          // 関数
          setTemperature={setTemperature}
          setVapor={setVapor}
          setCupTemperature={setCupTemperature}
          toggleExperiment={toggleExperiment}
        />
      </div>
    </div>
  );
};

export default Cup;