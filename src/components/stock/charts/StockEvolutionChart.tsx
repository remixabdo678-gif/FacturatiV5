import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockEvolutionData {
  month: string;
  initialStock: number;
  sold: number;
  remaining: number;
}

interface StockEvolutionChartProps {
  data: StockEvolutionData[];
  productName: string;
  unit: string;
}

export default function StockEvolutionChart({ data, productName, unit }: StockEvolutionChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.initialStock, d.sold, d.remaining]));
  
  const getBarHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  const getTrend = () => {
    if (data.length < 2) return { icon: Minus, color: 'text-gray-500', text: 'Données insuffisantes' };
    
    const firstMonth = data[0].remaining;
    const lastMonth = data[data.length - 1].remaining;
    
    if (lastMonth > firstMonth) {
      return { icon: TrendingUp, color: 'text-green-500', text: 'Tendance positive' };
    } else if (lastMonth < firstMonth) {
      return { icon: TrendingDown, color: 'text-red-500', text: 'Tendance négative' };
    } else {
      return { icon: Minus, color: 'text-gray-500', text: 'Tendance stable' };
    }
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Évolution du Stock</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{productName} ({unit})</p>
        </div>
        <div className={`flex items-center space-x-2 ${trend.color}`}>
          <TrendIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{trend.text}</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">{item.month}</span>
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-blue-600">Initial: {item.initialStock.toFixed(1)}</span>
                <span className="text-red-600">Vendu: {item.sold.toFixed(1)}</span>
                <span className="text-green-600">Restant: {item.remaining.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="relative h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* Stock initial (fond bleu) */}
              <div 
                className="absolute bottom-0 left-0 bg-gradient-to-t from-blue-400 to-blue-500 rounded-lg transition-all duration-700 ease-out"
                style={{ 
                  height: `${getBarHeight(item.initialStock)}%`,
                  width: '30%'
                }}
              />
              
              {/* Quantité vendue (rouge) */}
              <div 
                className="absolute bottom-0 left-[35%] bg-gradient-to-t from-red-400 to-red-500 rounded-lg transition-all duration-700 ease-out"
                style={{ 
                  height: `${getBarHeight(item.sold)}%`,
                  width: '30%',
                  animationDelay: '0.2s'
                }}
              />
              
              {/* Stock restant (vert) */}
              <div 
                className="absolute bottom-0 right-0 bg-gradient-to-t from-green-400 to-green-500 rounded-lg transition-all duration-700 ease-out"
                style={{ 
                  height: `${getBarHeight(item.remaining)}%`,
                  width: '30%',
                  animationDelay: '0.4s'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">Stock Initial</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">Quantité Vendue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">Stock Restant</span>
        </div>
      </div>
    </div>
  );
}