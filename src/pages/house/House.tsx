import React from "react";
import "./house.css";
import PageSelectButton from "../../components/common/Button/PageSelectButton";
import FurnitureSelectButton from "../../components/house/FurnitureSelectButton";

const House: React.FC = () => {

  return (
    <div className="house-page">
      <div className="page-button-layout">
        <PageSelectButton
        label="ホームに戻る"
        to="/"
        color="#3498db"
        />
      </div>

      <img src="/title/家具.png" alt="部屋のイラスト" className="house-picture" />

      <h1 className="question-text">どれについて調べますか？</h1>

      <div className="buttonContainer">
        <FurnitureSelectButton
          label="コップ"
          to="/cup"
          color="#28a745"
        />
        <FurnitureSelectButton
          label="窓（冬）"
          to="/winter-window"
          color="#28a745"
        />
        <FurnitureSelectButton
          label="タオル"
          to="/towel"
          color="#28a745"
        />
      </div>
    </div>
  );
};

export default House;