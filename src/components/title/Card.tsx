import React from "react";
import { PageSelectButton } from "./PageSelectButton";

type CardProps = {
  imageSrc: string;
  title: string;
  description: string;
  buttonLabel: string;
  to: string;            // ← 遷移先URLを受け取る
  buttonColor: string;  // ← 任意：ボタン色
};

export const Card: React.FC<CardProps> = ({
  imageSrc,
  title,
  description,
  buttonLabel,
  to,
  buttonColor,
}) => {
  return (
    <div
      style={{
  width: "100%",
  maxWidth: "420px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  overflow: "hidden",
  padding: "2vw",
  textAlign: "center",
  boxSizing: "border-box",
}}
    >
      <img src={imageSrc} alt={title} style={{ width: "100%", height: "auto" }} />
      <h2>{title}</h2>
      <p>{description}</p>
      <PageSelectButton label={buttonLabel} to={to} color={buttonColor} />
    </div>
  );
};
