import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface DonutData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: DonutData[];
  title: string;
  subtitle: string;
  centerValue: string;
  centerLabel: string;
}

export default function DonutChart({ data, title, subtitle, centerValue, centerLabel }: DonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [hiddenSegments, setHiddenSegments] = useState<Set<number>>(new Set());

  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Filtrer les données visibles
  const visibleData = data.filter((_, index) => !hiddenSegments.has(index));
  const totalVisible = visibleData.reduce((sum, item) => sum + item.value, 0);

  // Recalculer les pourcentages pour les segments visibles
  const adjustedData = visibleData.map(item => ({
    ...item,
    percentage: totalVisible > 0 ? (item.value / totalVisible) * 100 : 0
  }));

  let cumulativePercentage = 0;

  const toggleSegment = (index: number) => {
    const newHidden = new Set(hiddenSegments);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenSegments(newHidden);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {adjustedData.map((item, index) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference / 100;
              
              cumulativePercentage += item.percentage;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-700 ease-out cursor-pointer ${
                    hoveredSegment === index ? 'opacity-80' : 'opacity-100'
                  }`}
                  style={{
                    filter: hoveredSegment === index ? 'brightness(1.1)' : 'none',
                    transformOrigin: 'center'
                  }}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              );
            })}
          </svg>
          
          {/* Centre du donut */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{centerValue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{centerLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Légende interactive */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hiddenSegments.has(index) 
                ? 'bg-gray-50 dark:bg-gray-700 opacity-50' 
                : hoveredSegment === index 
                  ? 'bg-gray-100 dark:bg-gray-600' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onMouseEnter={() => setHoveredSegment(index)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => toggleSegment(index)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full transition-all duration-200"
                style={{ backgroundColor: item.color }}
              />
              <span className={`font-medium ${hiddenSegments.has(index) ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`text-sm font-bold ${hiddenSegments.has(index) ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {item.value.toLocaleString()}
                </div>
                <div className={`text-xs ${hiddenSegments.has(index) ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                {hiddenSegments.has(index) ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {visibleData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Tous les segments sont masqués</p>
          <button 
            onClick={() => setHiddenSegments(new Set())}
            className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Tout afficher
          </button>
        </div>
      )}
    </div>
  );
}