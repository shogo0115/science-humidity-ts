import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cup/cup.css";

import TowelControlPanel from "../../components/towel/TowelControlPanel";
import TowelCanvasAndLegend from "../../components/towel/TowelCanvasAndLegend";
import HumidityGraphCanvasMini from "../../components/towel/HumidityGraphCanvasMini";
import ExplanationBarGraph from "../../components/common/ExplanationBarGraph";
import ExperimentDescription from "../../components/towel/ExperimentDescription";
import CondensationStatusDisplay from "../../components/towel/CondensationStatusDisplay";

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

  /** ------- タオルの状態 ------- */
 const [water, setWater] = useState<number>(0.0);

/** ------- 実験の状態管理と初期値保存 ------- */
const [isExperimentRunning, setIsExperimentRunning] = useState<boolean>(false);

 // 問題文として表示する初期条件（実験開始時に固定される値）
 const [initialTemperature, setInitialTemperature] = useState<number>(25.0);
 const [initialVapor, setInitialVapor] = useState<number>(11.5);
 const [initialCupTemp, setInitialCupTemp] = useState<number>(0.0);
 const [initialWater, setInitialWater] = useState<number>(0.0);


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
    setInitialWater(water);
  }
 }, [isExperimentRunning, temperature, vapor, water]);


// 実験ロジック (コップの温度が目標値となるように室温を変化させるアニメーション)
 useEffect(() => {
  // 実験が実行中でなければ何もしない
  if (!isExperimentRunning) {
    return;
  }

  // 依存配列に humidity を追加したため、humidityが変更されるたびに
  // この Effect は再実行されますが、これは現在の湿度を最新に保つために必要です。
  if (humidity >= 100) {
    // Effectがセットアップされる時点で既に100%であれば、何もしない
    return;
  }

  const intervalId = setInterval(() => {

    // 湿度が100%になったら停止するチェック
    // ※注意: humidity の値はEffectが最後に実行された時点の値（クロージャ）です。
    // そのため、waterの更新ロジック内でチェックする方が確実ですが、ここでは一般的な方法で記載します。
    // waterの更新ロジック内のsetVaporによって湿度も更新されるため、次の実行時(0.5秒後)には最新値がチェックされます。
    if (humidity >= 100) {
        clearInterval(intervalId);
        return;
    }

    setWater(currentWater => {
      // waterが既に0g以下の場合は処理を停止するため、現在のwater値をそのまま返す
      if (currentWater <= 0) {
        clearInterval(intervalId); // water 0gで停止
        return 0;
      }

      // waterを0.1g減らす
      const nextWater = currentWater - 0.1;

      // waterが0g以下になる場合は、0gで停止
      if (nextWater <= 0) {
        // waterが0になった時点でインターバルを停止
        clearInterval(intervalId);

        // waterが減った分だけvaporを増やす
        // vaporが変化することでhumidityも更新され、次のサイクルで100%チェックが機能する
        setVapor(currentVapor => parseFloat((currentVapor + currentWater).toFixed(1)));

        return 0;
      }

      // 0.1gの蒸発処理
      setVapor(currentVapor => parseFloat((currentVapor + 0.1).toFixed(1)));
      return parseFloat(nextWater.toFixed(1));
    });
  }, 500);

  // クリーンアップ関数
  return () => clearInterval(intervalId);
  // 依存配列に humidity を追加
}, [isExperimentRunning, humidity, setWater, setVapor]);

  // 実験開始/停止を切り替える関数（初期値の保存と復元ロジックを追加）
  const toggleExperiment = () => {
    setIsExperimentRunning(prevIsRunning => {
      const nextIsRunning = !prevIsRunning;

      if (nextIsRunning) {
        setInitialTemperature(temperature);
        setInitialVapor(vapor);
        setInitialWater(water);

      } else {

        setTemperature(initialTemperature);
        setVapor(initialVapor);
      }

      return nextIsRunning;
    });
  };

    // まだ空気中に含むことができる水蒸気量
  const remainingVapor = useMemo(() => Math.max(0, saturationVapor - vapor), [saturationVapor, vapor]);

  // タオルの計算
 useEffect(() => {
  const w = Math.max(0, water);
  setWaterDrop(parseFloat(w.toFixed(1)));
}, [water]);



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
          <TowelCanvasAndLegend
          temperature={temperature}
          water={water}
          humidity={humidity}
          cupTemperature={cupTemperature}
          />
        </div>
        <div className="legend-formula-column">
          <ExplanationBarGraph />
          <CondensationStatusDisplay
          water={waterDrop}
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
        initialWater={initialWater}
        isExperimentRunning={isExperimentRunning}
        />
        <TowelControlPanel
          // データ
          temperature={temperature}
          saturationVapor={saturationVapor}
          vapor={vapor}
          cupTemperature={cupTemperature}
          water={water}
          remainingVapor={remainingVapor}
          isExperimentRunning={isExperimentRunning}
          // 関数
          setTemperature={setTemperature}
          setVapor={setVapor}
          setCupTemperature={setCupTemperature}
          setWater={setWater}
          toggleExperiment={toggleExperiment}
        />
      </div>
    </div>
  );
};

export default Cup;