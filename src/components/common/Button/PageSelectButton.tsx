import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <button
      className="page-select-button"
      style={{ backgroundColor: color }}
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );
};

export default PageSelectButton;
