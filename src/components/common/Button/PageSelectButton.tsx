import React from "react";
import './pageSelectButton.css';

type PageSelectButtonProps = {
  label: string;
  to: string;
  color: string;
};

export const PageSelectButton: React.FC<PageSelectButtonProps> = ({
  label,
  to,
  color,
}) => {
  const handleClick = () => {
    window.location.href = to;
  };

  return (
    <button
      className="page-select-button"
      style={{
        backgroundColor: color,
      }}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};

export default PageSelectButton;