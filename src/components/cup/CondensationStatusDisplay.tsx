import React from 'react';


interface CondensationStatusDisplayProps {
    waterDrop: number;
    humidity: number;
}

const CondensationStatusDisplay: React.FC<CondensationStatusDisplayProps> = ({
    waterDrop,
    humidity,
}) => {
    const isCondensed = waterDrop > 0.1;

    return (
        <div style={{ fontSize: "27px" }}>
            <div
                id="condensationText"
                style={{ color: isCondensed ? "#e74c3c" : "#7f8c8d", fontWeight: isCondensed ? "bold" : "normal" }}
            >
                {isCondensed ?
                    `結露が発生！ (${waterDrop.toFixed(1)}g/m³)` :
                    "結露は発生していません"
                }
            </div>

            <div id="humidityText">
                コップ表面の湿度: <span className="font-semibold text-blue-600">{humidity.toFixed(1)}</span>%
            </div>

        </div>
    );
};

export default CondensationStatusDisplay;