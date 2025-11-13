import React from 'react';


interface CondensationStatusDisplayProps {
    waterDrop: number;
    humidity: number; // コップ表面の湿度
}

const CondensationStatusDisplay: React.FC<CondensationStatusDisplayProps> = ({
    waterDrop,
    humidity,
}) => {
    const isCondensed = waterDrop > 0.1;

    return (
        <div className="flex flex-col items-center p-3 mt-4 w-full bg-white rounded-lg shadow-md border border-gray-200">

            {/* 結露判定 */}
            <div
                id="condensationText"
                className="text-lg mb-2 transition-colors duration-300"
                style={{ color: isCondensed ? "#e74c3c" : "#7f8c8d", fontWeight: isCondensed ? "bold" : "normal" }}
            >
                {isCondensed ?
                    `結露が発生！ (${waterDrop.toFixed(1)}g/m³)` :
                    "結露は発生していません"
                }
            </div>

            {/* コップ表面の湿度 */}
            <div id="humidityText" className="text-sm text-gray-700">
                コップ表面の湿度: <span className="font-semibold text-blue-600">{humidity.toFixed(1)}</span>%
            </div>

        </div>
    );
};

export default CondensationStatusDisplay;