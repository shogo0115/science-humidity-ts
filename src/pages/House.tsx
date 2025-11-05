import React from "react";
import { useNavigate } from "react-router-dom";
import "./house.css";

const House: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="house-page">
      <button className="backButton" onClick={() => navigate("/")}>
        ホームに戻る
      </button>

      {/* 写真 */}
      <img src="/title/家具.png" alt="部屋のイラスト" className="photo" />

      {/* 見出し */}
      <h1 className="question">どれについて調べますか？</h1>

      {/* ボタン群 */}
      <div className="buttonContainer">
        <button className="bigButton" onClick={() => navigate("/cup")}>
          コップ
        </button>
        <button className="bigButton" onClick={() => navigate("/winter-window")}>
          窓（冬）
        </button>
        <button className="bigButton" onClick={() => navigate("/towel")}>
          タオル
        </button>
      </div>
    </div>
  );
};

export default House;
