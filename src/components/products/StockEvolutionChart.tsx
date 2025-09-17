import React from 'react';
import { useStock } from '../../contexts/StockContext';
import { Product } from '../../contexts/DataContext';
import { BarChart3, TrendingUp, TrendingDown, Package, Calendar } from 'lucide-react';

interface StockEvolutionChartProps {
  product: Product;
}

export default function StockEvolutionChart({ product }: StockEvolutionChartProps) {
  const { getProductStockHistory } = useStock();
  
  const history = getProductStockHistory(product.id);
  
  // Générer les données pour les 30 derniers jours
  const generateChartData = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Trouver le stock à cette date
      const dayMovements = history.filter(movement => {
        const movementDate = new Date(movement.date);
        return movementDate <= date;
      });
      
      const stock = dayMovements.length > 0 ? dayMovements[0].newStock : product.initialStock || 0;
      
      days.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        stock,
        isToday: i === 0
      });
    }
    
    return days;
  };

  const chartData = generateChartData();
  const maxStock = Math.max(...chartData.map(d => d.stock), 1);
  const minStock = Math.min(...chartData.map(d => d.stock), 0);
  const currentStock = chartData[chartData.length - 1]?.stock || 0;
  const previousStock = chartData[chartData.length - 2]?.stock || 0;
  const trend = currentStock - previousStock;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Évolution du Stock - {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">30 derniers jours</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {trend > 0 ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <Package className="w-5 h-5 text-gray-500" />
          )}
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)} {product.unit}
          </span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-lg font-bold text-blue-600">{currentStock.toFixed(1)}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Stock actuel</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-lg font-bold text-green-600">{maxStock.toFixed(1)}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Maximum</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <div className="text-lg font-bold text-red-600">{minStock.toFixed(1)}</div>
          <div className="text-xs text-red-700 dark:text-red-300">Minimum</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-32 flex items-end space-x-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        {chartData.map((point, index) => {
          const height = maxStock > 0 ? (point.stock / maxStock) * 100 : 0;
          const isLowStock = point.stock <= product.minStock;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all duration-500 hover:opacity-80 ${
                  point.isToday 
                    ? 'bg-gradient-to-t from-purple-400 to-purple-500 ring-2 ring-purple-300' 
                    : isLowStock 
                      ? 'bg-gradient-to-t from-red-400 to-red-500'
                      : 'bg-gradient-to-t from-blue-400 to-blue-500'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${point.date}: ${point.stock.toFixed(1)} ${product.unit}`}
              />
              {index % 5 === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-left">
                  {point.date}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ligne de seuil minimum */}
      <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-3 h-3 bg-red-400 rounded"></div>
        <span>Stock en dessous du seuil minimum ({product.minStock.toFixed(1)} {product.unit})</span>
      </div>
    </div>
  );
}