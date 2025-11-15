import React from "react";
import "./house.css";
import { PageSelectButton } from "../../components/common/PageSelectButton";
import { FurnitureSelectButton } from "../../components/common/FurnitureSelectButton";

const House: React.FC = () => {
  const itemButtonColor = "#28a745";
  const backButtonColor = "#6c757d";

  return (
    <div className="house-page">
      <div className="backButton">
        <PageSelectButton
        label="ホームに戻る"
        to="/"
        color={backButtonColor}
        />
      </div>

      <img src="/title/家具.png" alt="部屋のイラスト" className="house" />

      <h1 className="question">どれについて調べますか？</h1>

      <div className="buttonContainer">
        <FurnitureSelectButton
          label="コップ"
          to="/cup"
          color={itemButtonColor}
        />
        <FurnitureSelectButton
          label="窓（冬）"
          to="/winter-window"
          color={itemButtonColor}
        />
        <FurnitureSelectButton
          label="タオル"
          to="/towel"
          color={itemButtonColor}
        />
      </div>
    </div>
  );
};

export default House;