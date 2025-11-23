import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../experimentPage.css";

import PageSelectButton from "../../components/common/Button/PageSelectButton";
import ExplanationBarGraph from "../../components/common/Explanation/ExplanationBarGraph/ExplanationBarGraph";
import HumidityGraphCanvasMini from "../../components/common/Explanation/HumidityGraphCanvasMini/HumidityGraphCanvasMini";
import WindowControlPanel from "../../components/window/ControlPanel/WindowControlPanel";
import WindowCanvasAndLegend from "../../components/window/ExperimentalFootage/WindowExperimentalFootage";
import ExperimentDescription from "../../components/window/ExperimentDescription/WindowExperimentDescription";
import CondensationStatusDisplay from "../../components/window/StatusDisplay/WindowStatusDisplay";

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
 const [originTemp, setOriginTemp] = useState<number>(25.0);
 const [saturationVapor, setSaturationVapor] = useState<number>(23.0);
 const [vapor, setVapor] = useState<number>(11.5);
 const [waterDrop, setWaterDrop] = useState<number>(0.0);
 const [humidity, setHumidity] = useState<number>(50);
 const remainingVapor = useMemo(() => Math.max(0, saturationVapor - vapor), [saturationVapor, vapor]);

 /** ------- コップの状態 ------- */
 const [tergetTemp, setTergetTemp] = useState<number>(0.0);

/** ------- 実験の状態管理と初期値保存 ------- */
const [isExperimentRunning, setIsExperimentRunning] = useState<boolean>(false);

 // 問題文として表示する初期条件（実験開始時に固定される値）
 const [initOriginTemp, setInitOriginTemp] = useState<number>(25.0);
 const [initialVapor, setInitialVapor] = useState<number>(11.5);
 const [initTergetTemp, setInitTergetTemp] = useState<number>(0.0);


 // ------------------------------------
 // 3. ユーザの操作による変化/計算ロジック
 // ------------------------------------
//飽和水蒸気量の計算
 useEffect(() => {
  const sv = satVapor(originTemp);
  setSaturationVapor(parseFloat(sv.toFixed(1)));
}, [originTemp]);

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
    setInitOriginTemp(originTemp);
    setInitialVapor(vapor);
    setInitTergetTemp(tergetTemp);
  }
 }, [isExperimentRunning, originTemp, vapor, tergetTemp]);


// 実験ロジック (コップの温度が目標値となるように室温を変化させるアニメーション)
 useEffect(() => {
  if (!isExperimentRunning) {
    return;
  }

  const targetTemp = initTergetTemp;

  const intervalId = setInterval(() => {
    setOriginTemp(currentT => {
      const nextT = currentT - 0.1;

      if (nextT <= targetTemp) {
        clearInterval(intervalId);
        return targetTemp;
      }

      return parseFloat(nextT.toFixed(1));
      });
    }, 200);

    // クリーンアップ関数
    return () => clearInterval(intervalId);
   }, [isExperimentRunning, initTergetTemp]);

  // 実験開始/停止を切り替える関数
  const toggleExperiment = () => {
    setIsExperimentRunning(prevIsRunning => {
      const nextIsRunning = !prevIsRunning;

      if (nextIsRunning) {
        setInitOriginTemp(originTemp);
        setInitialVapor(vapor);
        setInitTergetTemp(tergetTemp);

      } else {

        setOriginTemp(initOriginTemp);
        setVapor(initialVapor);
      }

      return nextIsRunning;
    });
  };


    // ------------------------------------
    // 4. UI
    // ------------------------------------
  return (
    <div className="overall-layout">
      <div className="page-button-layout">
              <PageSelectButton
              label="ホームに戻る"
              to="/"
              color= "#3498db"
              />
              <PageSelectButton
              label="違うものを調べる"
              to="/house"
              color= "#3498db"
              />
            </div>
      <div className="experiment-layout">
        <div className="experimental-footage">
          <WindowCanvasAndLegend
          temperature={tergetTemp}
          waterDrop={waterDrop}
          />
        </div>
        <div className="center-item-layout">
          <CondensationStatusDisplay
          waterDrop={waterDrop}
          humidity={humidity}
          />
          <ExplanationBarGraph />
        </div>
        <div className="graph-canvas">
          <HumidityGraphCanvasMini
          temp={originTemp}
          saturationVapor={saturationVapor}
          vapor={vapor}
          waterDrop={waterDrop}
          remainingVapor={remainingVapor}
          xAxisLabel={"室温 (窓のまわりの温度)[℃]"}
          yAxisLabel={"飽和水蒸気量[g/m³]"}
          />
        </div>
      </div>
      <div className="graph-controls">
        <ExperimentDescription
        initialTemperature={initOriginTemp}
        initialVapor={initialVapor}
        initialCupTemperature={initTergetTemp}
        isExperimentRunning={isExperimentRunning}
        />
        <WindowControlPanel
          originTemp={originTemp}
          vapor={vapor}
          tergetTemp={tergetTemp}
          isExperimentRunning={isExperimentRunning}
          setOriginTemp={setOriginTemp}
          setVapor={setVapor}
          setTergetTemp={setTergetTemp}
          toggleExperiment={toggleExperiment}
        />
      </div>
    </div>
  );
};

export default Cup;