import React from 'react';


interface CondensationStatusDisplayProps {
    water: number;
    humidity: number;
}

const CondensationStatusDisplay: React.FC<CondensationStatusDisplayProps> = ({
    water,
    humidity,
}) => {
    const isCondensed = water == 0.0;

    return (
        <div style={{ fontSize: "27px" }}>
            <div
                id="condensationText"
                style={{ color: isCondensed ? "#1dd664ff" : "#2688f8ff", fontWeight: isCondensed ? "normal" : "bold" }}
            >
                {isCondensed ?
                    "タオルが乾いた" :
                    `タオルは濡れている (${water.toFixed(1)}g/m³)`
                }
            </div>

            <div id="humidityText">
                湿度: <span className="font-semibold text-blue-600">{humidity.toFixed(1)}</span>%
            </div>

        </div>
    );
};

export default CondensationStatusDisplay;