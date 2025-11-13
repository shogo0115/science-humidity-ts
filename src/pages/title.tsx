// src/pages/Home.tsx
import React from "react";
import "./title.css";
import { Card } from "../components/title/Card";

export const Home: React.FC = () => {
  return (
    <div>
      <div className="top">
        <h1>湿度学習支援Webアプリケーション</h1>
        <p>
          中学2年時に学習する「湿度」について理解を深めるため作成されたWebアプリケーションです。
          タブレット端末を横にして活用することを想定したデザインとなっています。
        </p>
      </div>

      <div className="container">
        <Card
          imageSrc="/title/science.png"
          title="温度，飽和水蒸気量，水蒸気量，湿度の関係性を学ぶ"
          description="「温度」と「空間内の水分量」の変化が「湿度」や「水滴の量」にどのように影響を与えるかを、飽和水蒸気量グラフを使って理解しましょう。"
          buttonLabel="開く"
          to="/graph"
          buttonColor="#007bff"
        />

        <Card
          imageSrc="/title/家具（タイトル）.png"
          title="日常生活での湿度とその変化"
          description="「温度」や「水蒸気量」の変化が私たちの生活環境にどのような影響を与えるのかを学びましょう。"
          buttonLabel="開く"
          to="/house"
          buttonColor="#28a745"
        />
      </div>
    </div>
  );
};

export default Home;
