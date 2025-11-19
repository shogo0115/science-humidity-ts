import React from "react";
import { Link } from 'react-router-dom';
import './card.css';

type CardProps = {
  imageSrc: string;
  title: string;
  description: string;
  to: string;
};

export const Card: React.FC<CardProps> = ({
  imageSrc,
  title,
  description,
  to,
}) => {
  return (
    <Link to={to} className="card-link">
      <div className="card-image-container">
          <img src={imageSrc} alt={title} className="card-image" />
      </div>
      <div className="card-content">
          <h2>{title}</h2>
          <p>{description}</p>
      </div>
    </Link>
  );
};