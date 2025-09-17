import React, { useState } from 'react';
import { Product, StockMovement } from '../../contexts/DataContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Calendar, 
  ShoppingCart, 
  RotateCcw, 
  Plus,
  Minus,
  Activity,
  Clock
} from 'lucide-react';

interface EnhancedStockEvolutionChartProps {
  product: Product;
  movements: any[];
}

export default function EnhancedStockEvolutionChart({ product, movements }: EnhancedStockEvolutionChartProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'chart'>('chart');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  // Filtrer les mouvements selon la période
  const getFilteredMovements = () => {
    if (selectedPeriod === 'all') return movements;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        cutoffDate.setDate(now.getDate() - 90);
        break;
    }
    
    return movements.filter(movement => {
      const movementDate = new Date(movement.adjustmentDateTime || movement.date);
      return movementDate >= cutoffDate;
    });
  };

  const filteredMovements = getFilteredMovements();

  // Générer les données pour le graphique
  const generateChartData = () => {
    if (filteredMovements.length === 0) return [];
    
    // Trier par date croissante pour le graphique
    const sortedMovements = [...filteredMovements].sort((a, b) => {
      const dateA = new Date(a.adjustmentDateTime || a.date);
      const dateB = new Date(b.adjustmentDateTime || b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    return sortedMovements.map((movement, index) => {
      const date = new Date(movement.adjustmentDateTime || movement.date);
      return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        fullDateTime: date,
        stock: movement.newStock,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        userName: movement.userName,
        index
      };
    });
  };

  const chartData = generateChartData();
  const maxStock = Math.max(...chartData.map(d => d.stock), 1);
  const minStock = Math.min(...chartData.map(d => d.stock), 0);

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'initial':
        return '#3B82F6'; // Bleu
      case 'sale':
        return '#EF4444'; // Rouge
      case 'adjustment':
        return '#8B5CF6'; // Violet
      case 'return':
        return '#10B981'; // Vert
      default:
        return '#6B7280'; // Gris
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'initial':
        return <Package className="w-3 h-3" />;
      case 'sale':
        return <ShoppingCart className="w-3 h-3" />;
      case 'adjustment':
        return <RotateCcw className="w-3 h-3" />;
      case 'return':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'initial':
        return 'Stock initial';
      case 'sale':
        return 'Vente';
      case 'adjustment':
        return 'Rectification';
      case 'return':
        return 'Retour';
      default:
        return 'Mouvement';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Évolution du Stock - {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Historique détaillé avec date et heure
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">3 derniers mois</option>
            <option value="all">Toute la période</option>
          </select>
          
          {/* Toggle view mode */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Graphique
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-lg font-bold text-blue-600">
            {chartData.length > 0 ? chartData[chartData.length - 1].stock.toFixed(1) : '0'}
          </div>
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
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-lg font-bold text-purple-600">{filteredMovements.length}</div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Mouvements</div>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="space-y-6">
          {/* Graphique avec points et lignes */}
          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
            {chartData.length > 0 ? (
              <div className="relative h-full">
                {/* Ligne de stock minimum */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 opacity-50"
                  style={{ 
                    bottom: `${((product.minStock / maxStock) * 100)}%`
                  }}
                >
                  <span className="absolute -top-4 left-2 text-xs text-red-600 bg-white dark:bg-gray-800 px-1 rounded">
                    Min: {product.minStock.toFixed(1)}
                  </span>
                </div>
                
                {/* Points et lignes */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* Lignes de connexion */}
                  {chartData.map((point, index) => {
                    if (index === chartData.length - 1) return null;
                    const nextPoint = chartData[index + 1];
                    
                    const x1 = (index / (chartData.length - 1)) * 100;
                    const y1 = 100 - ((point.stock / maxStock) * 100);
                    const x2 = ((index + 1) / (chartData.length - 1)) * 100;
                    const y2 = 100 - ((nextPoint.stock / maxStock) * 100);
                    
                    return (
                      <line
                        key={`line-${index}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        className="opacity-70"
                      />
                    );
                  })}
                  
                  {/* Points */}
                  {chartData.map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 100;
                    const y = 100 - ((point.stock / maxStock) * 100);
                    
                    return (
                      <g key={`point-${index}`}>
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="6"
                          fill={getMovementColor(point.type)}
                          stroke="white"
                          strokeWidth="2"
                          className="hover:r-8 transition-all duration-200 cursor-pointer"
                          title={`${point.date} ${point.time} - ${getMovementLabel(point.type)}: ${point.stock.toFixed(1)} ${product.unit}`}
                        />
                        {/* Icône du type de mouvement */}
                        <foreignObject
                          x={`${x - 1.5}%`}
                          y={`${y - 1.5}%`}
                          width="12"
                          height="12"
                          className="pointer-events-none"
                        >
                          <div className="w-3 h-3 flex items-center justify-center text-white">
                            {getMovementIcon(point.type)}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Étiquettes des dates */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  {chartData.map((point, index) => {
                    if (index % Math.ceil(chartData.length / 6) !== 0) return null;
                    return (
                      <div key={index} className="text-center">
                        <div>{point.date}</div>
                        <div className="text-xs opacity-75">{point.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Aucun mouvement de stock</p>
                </div>
              </div>
            )}
          </div>

          {/* Légende */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Légende des Mouvements</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="flex items-center space-x-1">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Stock initial</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3 text-red-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vente</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <div className="flex items-center space-x-1">
                  <RotateCcw className="w-3 h-3 text-purple-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Rectification</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Retour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vue Timeline */
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Timeline des Mouvements</span>
          </h4>
          
          <div className="relative">
            {/* Ligne verticale de la timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="space-y-4">
              {filteredMovements.map((movement, index) => {
                const date = new Date(movement.adjustmentDateTime || movement.date);
                
                return (
                  <div key={movement.id} className="relative flex items-start space-x-4">
                    {/* Point sur la timeline */}
                    <div 
                      className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: getMovementColor(movement.type) }}
                    >
                      {getMovementIcon(movement.type)}
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {getMovementLabel(movement.type)}
                          </span>
                          <span className={`font-bold ${
                            movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity.toFixed(3)} {product.unit}
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{date.toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Stock avant:</span>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {movement.previousStock.toFixed(3)} {product.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Stock après:</span>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {movement.newStock.toFixed(3)} {product.unit}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Utilisateur:</span>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {movement.userName}
                          </div>
                        </div>
                      </div>
                      
                      {movement.reason && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Motif:</span> {movement.reason}
                        </div>
                      )}
                      
                      {movement.reference && (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Référence:</span> 
                          <span className="ml-1 font-mono text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                            {movement.reference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {filteredMovements.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucun mouvement pour cette période</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Changez la période ou créez des mouvements de stock
          </p>
        </div>
      )}
    </div>
  );
}