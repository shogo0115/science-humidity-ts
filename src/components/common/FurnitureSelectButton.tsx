import React from "react";
import './furnitureSelectButton.css';

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
  const handleClick = () => {
    window.location.href = to;
  };

  return (
    <button
      className="furniture-select-button"
      style={{
        backgroundColor: color,
      }}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};