import React from "react";
import { useNavigate } from "react-router-dom";
import "./furnitureSelectButton.css";

type FurnitureSelectButtonProps = {
  label: string;
  to: string;
  color: string;
};

export const FurnitureSelectButton: React.FC<FurnitureSelectButtonProps> = ({
  label,
  to,
  color,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button
      className="furniture-select-button"
      style={{ backgroundColor: color }}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};

export default FurnitureSelectButton;
