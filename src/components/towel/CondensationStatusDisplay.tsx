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
        <div className="flex flex-col items-center p-3 mt-4 w-full bg-white rounded-lg shadow-md border border-gray-200">

            {/* 結露判定 */}
            <div
                id="condensationText"
                className="text-lg mb-2 transition-colors duration-300"
                style={{ color: isCondensed ? "#2688f8ff" : "#1ffd74ff", fontWeight: isCondensed ? "bold" : "normal" }}
            >
                {isCondensed ?
                    `タオルは濡れている (${water.toFixed(1)}g/m³)` :
                    "タオルが乾いた"
                }
            </div>

            {/* コップ表面の湿度 */}
            <div id="humidityText" className="text-sm text-gray-700">
                湿度: <span className="font-semibold text-blue-600">{humidity.toFixed(1)}</span>%
            </div>

        </div>
    );
};

export default CondensationStatusDisplay;