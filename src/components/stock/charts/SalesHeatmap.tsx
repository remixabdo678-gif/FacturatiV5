import React, { useState } from 'react';
import { Calendar, Thermometer, Eye } from 'lucide-react';

interface HeatmapData {
  month: string;
  productName: string;
  quantity: number;
  value: number;
  intensity: number; // 0-1 pour la couleur
}

interface SalesHeatmapProps {
  data: HeatmapData[];
  products: string[];
  months: string[];
  selectedYear: number;
}

export default function SalesHeatmap({ data, products, months, selectedYear }: SalesHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ month: string; product: string } | null>(null);
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('quantity');

  const getCellData = (month: string, product: string) => {
    return data.find(d => d.month === month && d.productName === product);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    
    const colors = [
      'bg-red-100',    // 0-20%
      'bg-orange-200', // 20-40%
      'bg-yellow-300', // 40-60%
      'bg-green-400',  // 60-80%
      'bg-green-500'   // 80-100%
    ];
    
    const colorIndex = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[colorIndex];
  };

  const getTooltipContent = (cellData: HeatmapData | undefined, month: string, product: string) => {
    if (!cellData) {
      return {
        title: `${product} - ${month}`,
        content: 'Aucune vente'
      };
    }

    return {
      title: `${product} - ${month}`,
      content: `${cellData.quantity.toFixed(1)} unités • ${cellData.value.toLocaleString()} MAD`
    };
  };


}