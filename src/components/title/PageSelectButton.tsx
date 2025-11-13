import React from "react";

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
      style={{
        backgroundColor: color,
        color: "white",
        padding: "1vw 3vw",
        borderRadius: "0.8vw",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2vw",
        minWidth: "120px",
        maxWidth: "240px",
        transition: "0.3s",
      }}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};
